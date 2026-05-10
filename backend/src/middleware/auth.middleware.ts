import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/index.d';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }
  try {
    const decoded = verifyToken(header.slice(7)) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
}
