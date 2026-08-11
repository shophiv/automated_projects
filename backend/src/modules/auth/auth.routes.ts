import { Router } from 'express';
import { AuthController } from './auth.controller';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  authLimiter,
  [
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('ownerName').notEmpty().withMessage('Owner name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validateInput
  ],
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateInput
  ],
  authController.login
);

router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validateInput
  ],
  authController.refreshToken
);

router.post(
  '/password-reset',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    validateInput
  ],
  authController.passwordReset
);

export default router;