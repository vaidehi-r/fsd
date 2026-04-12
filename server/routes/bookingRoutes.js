import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), createBooking);
router.get('/my', verifyToken, requireRole('user'), getMyBookings);
router.put('/:id/cancel', verifyToken, requireRole('user'), cancelBooking);

export default router;
