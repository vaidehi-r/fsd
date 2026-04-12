import { Router } from 'express';
import {
  submitOwnerRequest, getOwnerDashboard, getOwnerBookings,
  confirmBooking, rejectBooking, getOwnerCars, exportBookings,
} from '../controllers/ownerController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { uploadOwnerDocs, handleUploadError } from '../middleware/upload.js';

const router = Router();

// Public — submit owner request with document uploads
router.post('/request', uploadOwnerDocs, handleUploadError, submitOwnerRequest);

// Owner-protected routes
router.get('/dashboard', verifyToken, requireRole('owner'), getOwnerDashboard);
router.get('/bookings', verifyToken, requireRole('owner'), getOwnerBookings);
router.put('/bookings/:id/confirm', verifyToken, requireRole('owner'), confirmBooking);
router.put('/bookings/:id/reject', verifyToken, requireRole('owner'), rejectBooking);
router.get('/cars', verifyToken, requireRole('owner'), getOwnerCars);
router.get('/export-bookings', verifyToken, requireRole('owner'), exportBookings);

export default router;
