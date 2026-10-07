import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
const router = Router();
router.route('/').get(getProducts).post(protect, adminOnly, createProduct);
router.route('/:id').get(getProduct).put(protect, adminOnly, updateProduct).delete(protect, adminOnly, deleteProduct);
export default router;
