import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      return res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      return res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(401).json({ status: 'error', code: 401, message: error.message });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      // Mocked password reset trigger
      return res.status(200).json({ status: 'success', message: 'Password reset instructions sent to email if registered.' });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      return res.status(200).json({ status: 'success', message: 'Password successfully reset.' });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  getMe = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', code: 401, message: 'Unauthorized' });
      }
      const user = await this.authService.getMe(req.user.id);
      return res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      return res.status(404).json({ status: 'error', code: 404, message: error.message });
    }
  };
}