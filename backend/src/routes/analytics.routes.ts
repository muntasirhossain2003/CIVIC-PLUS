import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/public', analyticsController.publicStats);
router.get('/admin',  authenticate, requireRole('admin'), analyticsController.adminStats);

export default router;
