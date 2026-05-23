import { Response } from 'express';
import { Notification } from '../models/Notification.model';
import { AuthRequest } from '../types/index.d';

function handleError(res: Response, err: unknown) {
  const e = err as Error & { status?: number };
  res.status(e.status ?? 500).json({ message: e.message ?? 'Internal server error' });
}

export const notificationController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const notifications = await Notification.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      res.json(notifications);
    } catch (err) { handleError(res, err); }
  },

  async markAllRead(req: AuthRequest, res: Response) {
    try {
      await Notification.updateMany({ userId: req.user!.id, read: false }, { read: true });
      res.json({ message: 'All notifications marked as read' });
    } catch (err) { handleError(res, err); }
  },

  async markOneRead(req: AuthRequest, res: Response) {
    try {
      const notif = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!.id },
        { read: true },
        { new: true },
      );
      if (!notif) { res.status(404).json({ message: 'Notification not found' }); return; }
      res.json(notif);
    } catch (err) { handleError(res, err); }
  },

  async unreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await Notification.countDocuments({ userId: req.user!.id, read: false });
      res.json({ count });
    } catch (err) { handleError(res, err); }
  },
};
