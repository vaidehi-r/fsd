import { Router } from 'express';
import {
  getDashboard, getUsers, suspendUser, deleteUser,
  getOwners, suspendOwner, deleteOwner,
  getOwnerRequests, approveOwnerRequest, rejectOwnerRequest,
  getAllBookings, approveDepositRefund, denyDepositRefund, getAllReviews,
  getSettings, updateSettings,
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// All admin routes are double-protected
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.put('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);

router.get('/owners', getOwners);
router.put('/owners/:id/suspend', suspendOwner);
router.delete('/owners/:id', deleteOwner);

router.get('/owner-requests', getOwnerRequests);
router.put('/owner-requests/:id/approve', approveOwnerRequest);
router.put('/owner-requests/:id/reject', rejectOwnerRequest);

router.get('/bookings', getAllBookings);
router.put('/bookings/:id/refund', approveDepositRefund);
router.put('/bookings/:id/deny-refund', denyDepositRefund);
router.get('/reviews', getAllReviews);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
