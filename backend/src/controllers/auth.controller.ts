import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types/index.d';
import { User } from '../models/User.model';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (Cognito refresh tokens last 30d by default)
};

function handleError(res: Response, err: unknown) {
  const e = err as Error & { status?: number };
  res.status(e.status ?? 500).json({ message: e.message ?? 'Internal server error' });
}

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) { handleError(res, err); }
  },

  async confirmEmail(req: Request, res: Response) {
    try {
      const result = await authService.confirmEmail(req.body);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async resendCode(req: Request, res: Response) {
    try {
      const result = await authService.resendCode(req.body.email);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async login(req: Request, res: Response) {
    try {
      const { accessToken, idToken, refreshToken, expiresIn, user } = await authService.login(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.json({ accessToken, idToken, expiresIn, user });
    } catch (err) { handleError(res, err); }
  },

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies[REFRESH_COOKIE];
      if (!token) { res.status(401).json({ message: 'No refresh token' }); return; }
      const result = await authService.refresh(token);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      const header = req.headers.authorization;
      if (header?.startsWith('Bearer ')) {
        await authService.logout(header.slice(7));
      }
      res.clearCookie(REFRESH_COOKIE);
      res.json({ message: 'Logged out' });
    } catch (err) { handleError(res, err); }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const result = await authService.resetPassword(req.body);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user!.id).select('-__v');
      res.json({ user });
    } catch (err) { handleError(res, err); }
  },
};
