import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { uploadController } from '../controllers/upload.controller';
import { presignedUrlSchema } from '../schemas/issue.schema';

const router = Router();

router.post('/presigned-url', authenticate, validate(presignedUrlSchema), uploadController.presignedUrl);

export default router;
