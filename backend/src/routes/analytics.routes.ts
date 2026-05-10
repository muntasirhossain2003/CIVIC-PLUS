import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// GET /api/analytics/public — no auth required
router.get('/public', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/analytics/admin — admin only
router.get('/admin', authenticate, requireRole('admin'), (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/analytics/export — CSV export (admin)
router.get('/export', authenticate, requireRole('admin'), (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
