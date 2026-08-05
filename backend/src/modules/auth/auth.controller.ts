import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

const registerSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.format(),
          },
        });
        return;
      }

      const result = await this.authService.register(validationResult.data);
      res.status(201).json({ data: result });
    } catch (error: any) {
      res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Internal server error',
        },
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.format(),
          },
        });
        return;
      }

      const result = await this.authService.login(validationResult.data);
      res.status(200).json({ data: result });
    } catch (error: any) {
      const status = error.message === 'Invalid email or password' ? 401 : 500;
      res.status(status).json({
        error: {
          code: status === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR',
          message: error.message || 'Internal server error',
        },
      });
    }
  };
}