import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError';

const registerSchema = z.object({
  business_name: z.string().min(2),
  owner_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(5),
  address: z.string().min(5),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  new_password: z.string().min(8),
});

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }

      const result = await this.authService.registerTenant(validation.data);
      return res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }

      const result = await this.authService.login(validation.data);
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError('Email is required', 400);
      }
      await this.authService.forgotPassword(email);
      return res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }

      await this.authService.resetPassword(validation.data);
      return res.status(200).json({
        status: 'success',
        message: 'Password successfully reset.',
      });
    } catch (error) {
      next(error);
    }
  };
}