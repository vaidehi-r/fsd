import { Router } from 'express';
import {
  register, login, logout, refreshTokenHandler,
  forgotPassword, resetPassword, getMe,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', refreshTokenHandler);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.get('/me', verifyToken, getMe);

export default router;
