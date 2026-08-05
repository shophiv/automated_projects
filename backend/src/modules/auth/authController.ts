import { Request, Response } from 'express';
import { AuthService } from './authService';
import { validateRegistrationPayload, validateLoginPayload } from '../../shared/validation/validation';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const validationError = validateRegistrationPayload(req.body);
    if (validationError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: validationError } });
      return;
    }

    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'REGISTRATION_FAILED', message: error.message } });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const validationError = validateLoginPayload(req.body);
    if (validationError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: validationError } });
      return;
    }

    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(401).json({ error: { code: 'AUTHENTICATION_FAILED', message: error.message } });
    }
  };
}