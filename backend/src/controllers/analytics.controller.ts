import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

function handleError(res: Response, err: unknown) {
  const e = err as Error & { status?: number };
  res.status(e.status ?? 500).json({ message: e.message ?? 'Internal server error' });
}

export const analyticsController = {
  async publicStats(_req: Request, res: Response) {
    try {
      const data = await analyticsService.publicStats();
      res.json(data);
    } catch (err) { handleError(res, err); }
  },

  async adminStats(_req: Request, res: Response) {
    try {
      const data = await analyticsService.adminStats();
      res.json(data);
    } catch (err) { handleError(res, err); }
  },
};
