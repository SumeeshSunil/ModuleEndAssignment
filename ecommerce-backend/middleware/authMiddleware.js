import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export async function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ');
  if (token?.[0] !== 'Bearer' || !token[1]) return res.status(401).json({ message: 'Please log in' });
  let decoded;
  try {
    decoded = jwt.verify(token[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ message: 'Your session expired. Please log in again' });
  }
  req.user = await User.findById(decoded.id);
  if (!req.user) return res.status(401).json({ message: 'Account not found' });
  next();
}

export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}
