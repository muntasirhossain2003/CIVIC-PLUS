import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signAccessToken(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}
