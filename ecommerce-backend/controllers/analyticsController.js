import Product from '../models/product.js';

export async function recommendations(req, res) {
  const product = await Product.findOne({ _id: req.params.id, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (process.env.RAPIDMINER_URL) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (process.env.RAPIDMINER_TOKEN) headers.Authorization = `apitoken ${process.env.RAPIDMINER_TOKEN}`;
      const response = await fetch(process.env.RAPIDMINER_URL, {
        method: 'POST', headers, signal: AbortSignal.timeout(5000),
        body: JSON.stringify({ data: [{ product_id: String(product._id), category: product.category, price: product.price }] })
      });
      if (!response.ok) throw new Error('Recommendation service failed');
      const result = await response.json();
      if (!Array.isArray(result.data)) throw new Error('Invalid recommendation response');
      const ids = result.data.map(row => row.recommended_product_id).filter(id => /^[a-f\d]{24}$/i.test(id));
      const products = await Product.find({ _id: { $in: ids, $ne: product._id }, active: true, stock: { $gt: 0 } }).limit(4);
      return res.json({ source: 'rapidminer', products });
    } catch (error) {
      console.error(error.message);
    }
  }
  const products = await Product.find({ _id: { $ne: product._id }, category: product.category, active: true, stock: { $gt: 0 } }).limit(4);
  res.json({ source: 'category', products });
}
