import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../controllers/orderController.js';
const router = Router();
router.use(protect);
router.route('/').get(getOrders).post(createOrder);
router.route('/:id').put(updateOrder).delete(adminOnly, deleteOrder);
export default router;
