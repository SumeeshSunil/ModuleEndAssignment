import bcrypt from 'bcryptjs';
import { validEmail, validPassword } from './authentication.js';

export async function getProfile(req, res) {
  res.json(req.user);
}

export async function updateProfile(req, res) {
  const { name, email, address, password } = req.body;
  if (typeof name !== 'string' || !name.trim() || !validEmail(email) || typeof address !== 'string') {
    return res.status(400).json({ message: 'Enter a name, valid email and address' });
  }
  req.user.name = name;
  req.user.email = email;
  req.user.address = address;
  if (password) {
    if (!validPassword(password)) return res.status(400).json({ message: 'Password must be 8 to 72 bytes' });
    req.user.password = await bcrypt.hash(password, 10);
  }
  await req.user.save();
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, address: req.user.address, role: req.user.role });
}

export async function deleteProfile(req, res) {
  await req.user.deleteOne();
  res.json({ message: 'Account deleted' });
}
