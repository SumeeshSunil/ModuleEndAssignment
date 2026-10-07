import mongoose from 'mongoose';

export default mongoose.model('Contact', new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  email: { type: String, required: true, maxlength: 254 },
  message: { type: String, required: true, maxlength: 2000 }
}, { timestamps: true }));
