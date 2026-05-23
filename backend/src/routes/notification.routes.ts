import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/',                        notificationController.list);
router.get('/unread-count',            notificationController.unreadCount);
router.patch('/read-all',              notificationController.markAllRead);
router.patch('/:id/read',              notificationController.markOneRead);

export default router;
