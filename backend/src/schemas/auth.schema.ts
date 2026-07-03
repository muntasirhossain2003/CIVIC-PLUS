import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character (e.g. @, #, !, $)');

export const registerSchema = z.object({
  name:     z.string().trim().min(2).max(50),
  email:    z.string().email().toLowerCase(),
  password: strongPassword,
  phone:    z.string().trim().optional(),
});

export const confirmEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
  code:  z.string().length(6, 'Code must be 6 digits'),  // Cognito sends a 6-digit code
});

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email:    z.string().email().toLowerCase(),
  code:     z.string().length(6, 'Code must be 6 digits'),  // Cognito sends a 6-digit code
  password: strongPassword,
});

export const updateMeSchema = z.object({
  name:  z.string().trim().min(2).max(50).optional(),
  phone: z.string().trim().optional(),
  notificationPrefs: z.object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
  }).optional(),
});

export type RegisterInput       = z.infer<typeof registerSchema>;
export type ConfirmEmailInput   = z.infer<typeof confirmEmailSchema>;
export type LoginInput          = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput  = z.infer<typeof resetPasswordSchema>;
export type UpdateMeInput       = z.infer<typeof updateMeSchema>;
