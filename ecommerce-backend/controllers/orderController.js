import mongoose from 'mongoose';
import Product from '../models/product.js';
import Order from '../models/order.js';

export async function createOrder(req, res) {
  const { items, address } = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 100 || typeof address !== 'string' || !address.trim() || address.length > 500) {
    return res.status(400).json({ message: 'Add products and enter a delivery address' });
  }
  if (items.some(item => !item || !mongoose.isValidObjectId(item.product) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100)) {
    return res.status(400).json({ message: 'Invalid cart quantity or product' });
  }
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const savedItems = [];
      let total = 0;
      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product, active: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }, { new: true, session }
        );
        if (!product) throw new Error('STOCK');
        savedItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity });
        total += Math.round(product.price * 100) * item.quantity;
      }
      [order] = await Order.create([{ user: req.user._id, items: savedItems, total: total / 100, address: address.trim() }], { session });
    });
    res.status(201).json(order);
  } catch (error) {
    if (error.message === 'STOCK') return res.status(409).json({ message: 'A product is unavailable or has insufficient stock. Update your cart' });
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getOrders(req, res) {
  res.json(await Order.find(req.user.role === 'admin' ? {} : { user: req.user._id }).sort({ createdAt: -1 }));
}

export async function updateOrder(req, res) {
  const { status } = req.body;
  if (!['Shipped', 'Delivered', 'Cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid order status' });
  if (req.user.role !== 'admin' && status !== 'Cancelled') return res.status(403).json({ message: 'Admin access required' });
  const session = await mongoose.startSession();
  let updated;
  try {
    await session.withTransaction(async () => {
      const filter = { _id: req.params.id };
      if (req.user.role !== 'admin') filter.user = req.user._id;
      filter.status = status === 'Delivered' ? 'Shipped' : 'Placed';
      updated = await Order.findOneAndUpdate(filter, { status }, { new: true, session });
      if (updated && status === 'Cancelled') {
        for (const item of updated.items) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
      }
    });
    if (!updated) return res.status(409).json({ message: 'Order not found or this status change is not allowed' });
    res.json(updated);
  } finally {
    await session.endSession();
  }
}

export async function deleteOrder(req, res) {
  const order = await Order.findOneAndDelete({ _id: req.params.id, status: { $in: ['Cancelled', 'Delivered'] } });
  if (!order) return res.status(409).json({ message: 'Only delivered or cancelled orders can be deleted' });
  res.json({ message: 'Order deleted' });
}
