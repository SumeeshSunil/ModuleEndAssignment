import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authenticationRoutes.js';
import profileRoutes from './routes/userProfileRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import Contact from './models/contact.js';
import { validEmail } from './controllers/authentication.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ message: 'Student Shop API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', analyticsRoutes);
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (typeof name !== 'string' || !name.trim() || !validEmail(email) || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Please fill in all fields with a valid email' });
  }
  await Contact.create({ name: name.trim(), email: email.trim(), message: message.trim() });
  res.status(201).json({ message: 'Your message has been saved. Thank you!' });
});
app.use((req, res) => res.status(404).json({ message: 'Page not found' }));
app.use(errorHandler);
export default app;
