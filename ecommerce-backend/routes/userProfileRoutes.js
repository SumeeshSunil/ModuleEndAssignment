import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, deleteProfile } from '../controllers/userProfile.js';
const router = Router();
router.use(protect);
router.route('/').get(getProfile).put(updateProfile).delete(deleteProfile);
export default router;
