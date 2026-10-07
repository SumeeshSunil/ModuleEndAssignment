import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const validPassword = value => typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value) <= 72;

function response(user) {
  return {
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, address: user.address }
  };
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (typeof name !== 'string' || !name.trim() || !validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: 'Enter a name, valid email and password of 8 to 72 bytes' });
  }
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json(response(user));
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!validEmail(email) || typeof password !== 'string') return res.status(400).json({ message: 'Enter your email and password' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Incorrect email or password' });
  res.json(response(user));
}
