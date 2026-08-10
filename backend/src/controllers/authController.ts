import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';

const registerSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  owner_name: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.errors,
          },
        });
        return;
      }

      const result = await AuthService.registerRetailer(validationResult.data);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message || 'Failed to register retailer',
        },
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.errors,
          },
        });
        return;
      }

      const result = await AuthService.login(validationResult.data);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error.message || 'Invalid credentials',
        },
      });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } });
      return;
    }
    // Stub implementation for password reset initiation
    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been dispatched.',
    });
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, new_password } = req.body;
    if (!token || !new_password || new_password.length < 8) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid token and minimum 8-char password required' } });
      return;
    }
    // Stub implementation for completing password reset
    res.status(200).json({
      success: true,
      message: 'Password successfully reset.',
    });
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const profile = await AuthService.getUserProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message || 'User profile not found',
        },
      });
    }
  }
}