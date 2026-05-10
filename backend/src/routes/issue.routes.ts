import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(apiLimiter);

// GET /api/issues — list with filters + pagination (public)
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/issues/nearby — geospatial duplicate check
router.get('/nearby', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/issues/:id — detail (public)
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/issues — create (citizen)
router.post('/', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// PATCH /api/issues/:id — edit (reporter, 1hr)
router.patch('/:id', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// DELETE /api/issues/:id — delete (reporter 1hr | admin anytime)
router.delete('/:id', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// PATCH /api/issues/:id/status — status transition (staff/admin)
router.patch('/:id/status', authenticate, requireRole('staff', 'admin'), (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/issues/:id/upvote
router.post('/:id/upvote', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/issues/:id/follow
router.post('/:id/follow', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/issues/:id/comments
router.post('/:id/comments', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
