import Product from '../models/product.js';

export async function getProducts(req, res) {
  const filter = { active: true };
  if (req.query.search) filter.name = { $regex: String(req.query.search).slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (req.query.category) filter.category = String(req.query.category);
  const sorts = { newest: { createdAt: -1 }, low: { price: 1 }, high: { price: -1 }, name: { name: 1 } };
  const products = await Product.find(filter).sort(sorts[req.query.sort] || sorts.newest).limit(100);
  const categories = await Product.distinct('category', { active: true });
  res.json({ products, categories });
}

export async function getProduct(req, res) {
  const product = await Product.findOne({ _id: req.params.id, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

function productData(body) {
  return { name: body.name, description: body.description, price: body.price, category: body.category, image: body.image, stock: body.stock };
}

export async function createProduct(req, res) {
  res.status(201).json(await Product.create(productData(req.body)));
}

export async function updateProduct(req, res) {
  const product = await Product.findOneAndUpdate({ _id: req.params.id, active: true }, productData(req.body), { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndUpdate({ _id: req.params.id, active: true }, { active: false });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}
