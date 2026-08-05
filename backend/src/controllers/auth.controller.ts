import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { validateEmail, validateRequiredFields } from '../utils/validation.js';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const missing = validateRequiredFields(['email', 'password'], req.body);
      if (missing.length > 0) {
        res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        return;
      }

      if (!validateEmail(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      const result = await this.authService.authenticate(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Authentication failed' });
    }
  };
}