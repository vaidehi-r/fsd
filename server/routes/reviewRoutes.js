import { Router } from 'express';
import { createReview, getCarReviews, replyToReview, deleteReview } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), createReview);
router.get('/car/:carId', getCarReviews);
router.post('/:id/reply', verifyToken, requireRole('owner'), replyToReview);
router.delete('/:id', verifyToken, requireRole('admin'), deleteReview);

export default router;
