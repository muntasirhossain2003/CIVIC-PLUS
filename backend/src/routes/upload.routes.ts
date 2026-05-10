import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/uploads/presigned-url — get S3 pre-signed URL
router.post('/presigned-url', authenticate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
