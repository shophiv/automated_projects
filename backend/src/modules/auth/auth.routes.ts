import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { z } from 'zod';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();
const controller = new AuthController();

const registerSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(6, 'Valid phone number required'),
    address: z.string().min(5, 'Address is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/register', authLimiter, validateRequest(registerSchema), controller.register);
router.post('/login', authLimiter, validateRequest(loginSchema), controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/me', authenticateJWT, controller.getMe);

export default router;