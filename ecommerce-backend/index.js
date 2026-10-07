import 'dotenv/config';
import app from './app.js';
import connectDB from './config/dbConnection.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace-')) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in .env');
}
await connectDB();
app.listen(process.env.PORT || 5000, () => console.log('Server started'));
