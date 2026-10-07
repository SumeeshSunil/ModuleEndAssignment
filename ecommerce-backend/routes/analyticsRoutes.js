import { Router } from 'express';
import { recommendations } from '../controllers/analyticsController.js';
const router = Router();
router.get('/:id', recommendations);
export default router;
