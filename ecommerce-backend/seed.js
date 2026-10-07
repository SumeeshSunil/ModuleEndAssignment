import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/dbConnection.js';
import Product from './models/product.js';
import User from './models/user.js';
import { validEmail, validPassword } from './controllers/authentication.js';

await connectDB();
try {
  if (await Product.countDocuments() === 0) {
    await Product.insertMany([
      { name: 'Notebook', description: 'A ruled notebook for class notes and daily writing.', category: 'Stationery', price: 80, stock: 50 },
      { name: 'Pen Set', description: 'A set of five blue ballpoint pens.', category: 'Stationery', price: 60, stock: 40 },
      { name: 'Backpack', description: 'A simple backpack with room for books and a laptop.', category: 'Accessories', price: 799, stock: 15 },
      { name: 'Water Bottle', description: 'A reusable one litre bottle for everyday use.', category: 'Accessories', price: 249, stock: 30 },
      { name: 'Desk Lamp', description: 'A compact reading lamp for your study table.', category: 'Electronics', price: 599, stock: 12 },
      { name: 'Wired Mouse', description: 'A USB mouse for everyday computer work.', category: 'Electronics', price: 299, stock: 20 },
      { name: 'Cotton T-Shirt', description: 'A comfortable plain cotton t-shirt in medium size.', category: 'Clothing', price: 399, stock: 25 },
      { name: 'Cotton Cap', description: 'A lightweight cap with an adjustable strap.', category: 'Clothing', price: 199, stock: 18 }
    ]);
    console.log('Sample products added');
  }
  if (process.env.ADMIN_PASSWORD) {
    if (!validEmail(process.env.ADMIN_EMAIL) || !validPassword(process.env.ADMIN_PASSWORD)) throw new Error('Use a valid admin email and password of 8 to 72 bytes');
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (!await User.findOne({ email })) {
      await User.create({ name: 'Admin', email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10), role: 'admin' });
      console.log('Admin account created');
    } else console.log('Admin email already exists; existing account was not changed');
  }
} finally {
  await mongoose.disconnect();
}
