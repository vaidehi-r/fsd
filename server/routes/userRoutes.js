import { Router } from 'express';
import { getProfile, updateProfile, updateAvatar, changePassword } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadAvatar, handleUploadError } from '../middleware/upload.js';

const router = Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/avatar', verifyToken, uploadAvatar, handleUploadError, updateAvatar);
router.put('/change-password', verifyToken, changePassword);

export default router;
