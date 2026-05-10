import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types/index.d';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query as { token: string };
      if (!token) { res.status(400).json({ message: 'Token is required' }); return; }
      const result = await authService.verifyEmail(token);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async login(req: Request, res: Response) {
    try {
      const { accessToken, refreshToken, user } = await authService.login(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.json({ accessToken, user });
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

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies[REFRESH_COOKIE];
      if (token) await authService.logout(token);
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
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async me(req: AuthRequest, res: Response) {
    res.json({ user: req.user });
  },
};
