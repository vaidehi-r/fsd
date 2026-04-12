import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.get('/', verifyToken, requireRole('user'), getWishlist);
router.post('/:carId', verifyToken, requireRole('user'), addToWishlist);
router.delete('/:carId', verifyToken, requireRole('user'), removeFromWishlist);

export default router;
