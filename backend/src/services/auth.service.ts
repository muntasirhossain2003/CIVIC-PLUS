import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { emailService } from './email.service';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await User.findOne({ email: input.email });
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

    const passwordHash = await bcrypt.hash(input.password, 12);
    const verifyToken = generateToken();

    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      emailVerifyToken: hashToken(verifyToken),
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    await emailService.sendVerification(user.email, verifyToken);

    return { message: 'Registered. Check your email to verify your account.' };
  },

  async verifyEmail(token: string) {
    const hashed = hashToken(token);
    const user = await User.findOne({
      emailVerifyToken: hashed,
      emailVerifyExpires: { $gt: new Date() },
    });
    if (!user) throw Object.assign(new Error('Invalid or expired verification link'), { status: 400 });

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    return { message: 'Email verified. You can now log in.' };
  },

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email });
    if (!user) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

    if (!user.emailVerified)
      throw Object.assign(new Error('Please verify your email before logging in'), { status: 403 });

    const payload = { id: user._id.toString(), role: user.role, departmentId: user.departmentId?.toString() };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  },

  async refresh(refreshToken: string) {
    let payload: { id: string; role: string; departmentId?: string };
    try {
      payload = verifyToken(refreshToken) as typeof payload;
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }

    const user = await User.findById(payload.id);
    if (!user || user.refreshTokenHash !== hashToken(refreshToken))
      throw Object.assign(new Error('Refresh token revoked'), { status: 401 });

    const newAccessToken = signAccessToken({ id: user._id.toString(), role: user.role, departmentId: user.departmentId?.toString() });
    return { accessToken: newAccessToken };
  },

  async logout(refreshToken: string) {
    const payload = verifyToken(refreshToken) as { id: string };
    await User.findByIdAndUpdate(payload.id, { $unset: { refreshTokenHash: 1 } });
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    // Always return success — don't leak whether email exists
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const token = generateToken();
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    await emailService.sendPasswordReset(email, token);
    return { message: 'If that email exists, a reset link has been sent.' };
  },

  async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) throw Object.assign(new Error('Invalid or expired reset link'), { status: 400 });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokenHash = undefined; // invalidate all sessions
    await user.save();

    return { message: 'Password reset successful. You can now log in.' };
  },
};
