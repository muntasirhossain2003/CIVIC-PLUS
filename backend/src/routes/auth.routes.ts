import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { authController } from '../controllers/auth.controller';
import {
  registerSchema,
  confirmEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema,
} from '../schemas/auth.schema';

const router = Router();

router.use(authLimiter);

router.post('/register',        validate(registerSchema),       authController.register);
router.post('/confirm-email',   validate(confirmEmailSchema),   authController.confirmEmail);
router.post('/resend-code',                                     authController.resendCode);
router.post('/login',           validate(loginSchema),          authController.login);
router.post('/refresh',                                         authController.refresh);
router.post('/logout',                                          authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  authController.resetPassword);
router.get('/me',                authenticate,                     authController.me);
router.patch('/me',              authenticate, validate(updateMeSchema), authController.updateMe);

export default router;
