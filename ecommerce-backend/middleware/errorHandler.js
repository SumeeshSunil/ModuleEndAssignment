export default function errorHandler(error, req, res, next) {
  if (error.code === 11000) return res.status(409).json({ message: 'Email is already registered' });
  if (error.name === 'ValidationError' || error.name === 'CastError' || error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Please check the information you entered' });
  }
  console.error(error.message);
  res.status(500).json({ message: 'Something went wrong. Please try again' });
}
