import { Router } from 'express';
import { createReport, getReports, resolveReport } from '../controllers/reportController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), createReport);
router.get('/', verifyToken, requireRole('admin'), getReports);
router.put('/:id/resolve', verifyToken, requireRole('admin'), resolveReport);

export default router;
