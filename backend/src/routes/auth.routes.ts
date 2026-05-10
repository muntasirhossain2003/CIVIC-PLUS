import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authLimiter);

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/auth/verify-email
router.get('/verify-email', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
