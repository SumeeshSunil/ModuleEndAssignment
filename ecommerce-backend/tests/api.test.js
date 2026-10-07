import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { createServer } from 'node:http';
import app from '../app.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import Contact from '../models/contact.js';

let database;
let customer;
let otherCustomer;
let admin;
let product;
let order;
const auth = token => ({ Authorization: `Bearer ${token}` });

before(async () => {
  process.env.JWT_SECRET = 'integration-test-secret-at-least-32-characters';
  database = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ storageEngine: 'wiredTiger' }] });
  await mongoose.connect(database.getUri());
  await User.init();
}, { timeout: 180000 });

after(async () => {
  await mongoose.disconnect();
  if (database) await database.stop();
});

test('registration validates input and cannot assign an admin role', async () => {
  await request(app).post('/api/auth/register').send({ name: 'Test', email: 'bad', password: 'short' }).expect(400);
  const result = await request(app).post('/api/auth/register').send({ name: 'Customer', email: 'customer@example.com', password: 'Password123', role: 'admin' }).expect(201);
  customer = result.body.token;
  assert.equal(result.body.user.role, 'user');
  assert.equal(result.body.user.password, undefined);
  const stored = await User.findOne({ email: 'customer@example.com' }).select('+password');
  assert.notEqual(stored.password, 'Password123');
  await request(app).post('/api/auth/register').send({ name: 'Duplicate', email: 'customer@example.com', password: 'Password123' }).expect(409);
  otherCustomer = (await request(app).post('/api/auth/register').send({ name: 'Other', email: 'other@example.com', password: 'Password123' }).expect(201)).body.token;
});

test('login checks passwords and admin routes enforce roles', async () => {
  await request(app).post('/api/auth/login').send({ email: 'customer@example.com', password: 'incorrect' }).expect(401);
  await request(app).post('/api/auth/login').send({ email: 'customer@example.com', password: 'Password123' }).expect(200);
  await request(app).get('/api/profile').expect(401);
  await request(app).get('/api/profile').set(auth('invalid')).expect(401);
  await request(app).post('/api/products').set(auth(customer)).send({}).expect(403);
  await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@example.com', password: 'Password123' }).expect(201);
  await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });
  admin = (await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Password123' }).expect(200)).body.token;
});

test('admin product CRUD and public filtering work', async () => {
  product = (await request(app).post('/api/products').set(auth(admin)).send({ name: 'Notebook', description: 'Ruled notebook', category: 'Stationery', price: 80, stock: 10 }).expect(201)).body;
  await request(app).post('/api/products').set(auth(admin)).send({ name: 'Invalid', description: 'Test', category: 'Stationery', price: -5, stock: 1 }).expect(400);
  await request(app).post('/api/products').set(auth(admin)).send({ name: 'Pen', description: 'Blue pen', category: 'Stationery', price: 20, stock: 10 }).expect(201);
  const list = await request(app).get('/api/products?category=Stationery&sort=low').expect(200);
  assert.equal(list.body.products[0].name, 'Pen');
  assert.equal((await request(app).get('/api/products?search=note')).body.products.length, 1);
  assert.equal((await request(app).get('/api/products?search=%5B')).body.products.length, 0);
  await request(app).get('/api/products/bad-id').expect(400);
  await request(app).get(`/api/products/${product._id}`).expect(200);
  await request(app).put(`/api/products/${product._id}`).set(auth(admin)).send({ ...product, description: 'Updated notebook' }).expect(200);
});

test('checkout uses backend prices and reserves stock', async () => {
  await request(app).post('/api/orders').set(auth(customer)).send({ items: [{ product: product._id, quantity: -1 }], address: 'Test address' }).expect(400);
  order = (await request(app).post('/api/orders').set(auth(customer)).send({ items: [{ product: product._id, quantity: 2, price: 1 }], total: 1, address: 'Test address' }).expect(201)).body;
  assert.equal(order.total, 160);
  assert.equal((await Product.findById(product._id)).stock, 8);
  assert.equal((await request(app).get('/api/orders').set(auth(otherCustomer))).body.length, 0);
  await request(app).put(`/api/orders/${order._id}`).set(auth(otherCustomer)).send({ status: 'Cancelled' }).expect(409);
  await request(app).put(`/api/orders/${order._id}`).set(auth(customer)).send({ status: 'Shipped' }).expect(403);
});

test('failed checkout rolls back stock and cancellation restores it once', async () => {
  await request(app).post('/api/orders').set(auth(customer)).send({ items: [{ product: product._id, quantity: 1 }, { product: product._id, quantity: 100 }], address: 'Test address' }).expect(409);
  assert.equal((await Product.findById(product._id)).stock, 8);
  await request(app).put(`/api/orders/${order._id}`).set(auth(customer)).send({ status: 'Cancelled' }).expect(200);
  assert.equal((await Product.findById(product._id)).stock, 10);
  await request(app).put(`/api/orders/${order._id}`).set(auth(customer)).send({ status: 'Cancelled' }).expect(409);
  assert.equal((await Product.findById(product._id)).stock, 10);
  await request(app).delete(`/api/orders/${order._id}`).set(auth(customer)).expect(403);
  await request(app).delete(`/api/orders/${order._id}`).set(auth(admin)).expect(200);
});

test('concurrent checkouts cannot oversell the last item', async () => {
  await Product.findByIdAndUpdate(product._id, { stock: 1 });
  const payload = { items: [{ product: product._id, quantity: 1 }], address: 'Test address' };
  const results = await Promise.all([
    request(app).post('/api/orders').set(auth(customer)).send(payload),
    request(app).post('/api/orders').set(auth(otherCustomer)).send(payload)
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  assert.equal((await Product.findById(product._id)).stock, 0);
  const placed = results.find(result => result.status === 201).body;
  await request(app).delete(`/api/orders/${placed._id}`).set(auth(admin)).expect(409);
  await request(app).put(`/api/orders/${placed._id}`).set(auth(admin)).send({ status: 'Delivered' }).expect(409);
  await request(app).put(`/api/orders/${placed._id}`).set(auth(admin)).send({ status: 'Shipped' }).expect(200);
  await request(app).put(`/api/orders/${placed._id}`).set(auth(admin)).send({ status: 'Cancelled' }).expect(409);
  await request(app).put(`/api/orders/${placed._id}`).set(auth(admin)).send({ status: 'Delivered' }).expect(200);
  await request(app).delete(`/api/orders/${placed._id}`).set(auth(admin)).expect(200);
});

test('profile updates validate input and never promote users', async () => {
  await request(app).put('/api/profile').set(auth(customer)).send({ name: 'Customer', email: 'bad', address: '' }).expect(400);
  const result = await request(app).put('/api/profile').set(auth(customer)).send({ name: 'Updated', email: 'customer@example.com', address: 'New address', role: 'admin', password: 'ChangedPass123' }).expect(200);
  assert.equal(result.body.role, 'user');
  assert.equal(result.body.password, undefined);
  await request(app).post('/api/auth/login').send({ email: 'customer@example.com', password: 'ChangedPass123' }).expect(200);
});

test('contact validation saves only complete messages', async () => {
  await request(app).post('/api/contact').send({ name: 'Test', email: 'bad', message: 'Hello' }).expect(400);
  await request(app).post('/api/contact').send({ name: 'Test', email: 'test@example.com', message: 'Hello' }).expect(201);
  assert.equal(await Contact.countDocuments(), 1);
});

test('recommendations clearly identify fallback and support the RapidMiner adapter contract', async () => {
  delete process.env.RAPIDMINER_URL;
  const fallback = await request(app).get(`/api/recommendations/${product._id}`).expect(200);
  assert.equal(fallback.body.source, 'category');
  assert.equal(fallback.body.products[0].name, 'Pen');
  const pen = await Product.findOne({ name: 'Pen' });
  let received;
  let authorization;
  const service = createServer((req, res) => {
    let body = '';
    req.on('data', data => { body += data; });
    req.on('end', () => {
      received = JSON.parse(body);
      authorization = req.headers.authorization;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ data: [{ recommended_product_id: String(pen._id) }] }));
    });
  });
  await new Promise(resolve => service.listen(0, '127.0.0.1', resolve));
  process.env.RAPIDMINER_URL = `http://127.0.0.1:${service.address().port}`;
  process.env.RAPIDMINER_TOKEN = 'test-token';
  try {
    const result = await request(app).get(`/api/recommendations/${product._id}`).expect(200);
    assert.equal(result.body.source, 'rapidminer');
    assert.equal(result.body.products[0]._id, String(pen._id));
    assert.equal(received.data[0].product_id, product._id);
    assert.equal(authorization, 'apitoken test-token');
  } finally {
    await new Promise(resolve => service.close(resolve));
    delete process.env.RAPIDMINER_URL;
    delete process.env.RAPIDMINER_TOKEN;
  }
});

test('product and account deletion remove access', async () => {
  await request(app).delete(`/api/products/${product._id}`).set(auth(admin)).expect(200);
  await request(app).get(`/api/products/${product._id}`).expect(404);
  await request(app).delete('/api/profile').set(auth(customer)).expect(200);
  await request(app).get('/api/profile').set(auth(customer)).expect(401);
});
