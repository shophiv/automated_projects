import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SettingsService } from './settings.service';

export class SettingsController {
  private settingsService = new SettingsService();

  getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const settings = await this.settingsService.getSettings(retailerId);
      res.status(200).json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const settings = await this.settingsService.updateSettings(retailerId, req.body);
      res.status(200).json(settings);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}