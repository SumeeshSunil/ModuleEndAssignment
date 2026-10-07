import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, min: 1, required: true }
  }],
  address: { type: String, required: true, maxlength: 500 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Placed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
