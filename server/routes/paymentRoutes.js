import { Router } from 'express';
import { createOrder, verifyPayment, getMyPayments } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.post('/create-order', verifyToken, requireRole('user'), createOrder);
router.post('/verify', verifyToken, requireRole('user'), verifyPayment);
router.get('/my', verifyToken, requireRole('user'), getMyPayments);

export default router;
