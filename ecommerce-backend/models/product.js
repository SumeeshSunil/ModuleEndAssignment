import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  image: { type: String, default: '', maxlength: 2000 },
  stock: { type: Number, required: true, min: 0, validate: Number.isInteger },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
