import { Response } from 'express';
import { uploadService } from '../services/upload.service';
import { AuthRequest } from '../types/index.d';

export const uploadController = {
  async presignedUrl(req: AuthRequest, res: Response) {
    try {
      const { filename, contentType } = req.body;
      const result = await uploadService.getPresignedUrl(filename, contentType, req.user!.id);
      res.json(result);
    } catch (err) {
      const e = err as Error & { status?: number };
      res.status(e.status ?? 500).json({ message: e.message });
    }
  },
};
