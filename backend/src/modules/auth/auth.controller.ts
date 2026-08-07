import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { z } from 'zod';

const registerSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  address: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['Owner', 'Manager', 'Cashier'])
});

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await this.authService.registerRetailer(validated);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.authService.login(validated);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' } });
      }
      const result = await this.authService.refreshToken(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mock implementation for password reset request
      res.status(200).json({ success: true, message: 'Password reset instructions sent if email exists' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mock implementation for password reset completion
      res.status(200).json({ success: true, message: 'Password successfully reset' });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const retailerId = req.user!.retailerId;
      const users = await this.authService.getUsers(retailerId);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = createUserSchema.parse(req.body);
      const retailerId = req.user!.retailerId;
      const user = await this.authService.createUser(retailerId, validated);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };
}