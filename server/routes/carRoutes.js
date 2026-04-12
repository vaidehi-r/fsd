import { Router } from 'express';
import {
  getCars, getCarById, getBookedDates,
  createCar, updateCar, deleteCar,
  addCarImages, deleteCarImage,
} from '../controllers/carController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { uploadCarImages, handleUploadError } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);
router.get('/:id/booked-dates', getBookedDates);

// Owner routes
router.post('/', verifyToken, requireRole('owner'), uploadCarImages, handleUploadError, createCar);
router.put('/:id', verifyToken, requireRole('owner'), updateCar);
router.delete('/:id', verifyToken, requireRole('owner', 'admin'), deleteCar);
router.post('/:id/images', verifyToken, requireRole('owner'), uploadCarImages, handleUploadError, addCarImages);
router.delete('/:id/images/:publicId', verifyToken, requireRole('owner'), deleteCarImage);

export default router;
