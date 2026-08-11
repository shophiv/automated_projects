import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PricingService } from './pricing.service';

export class PricingController {
  private pricingService = new PricingService();

  configureMargins = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const result = await this.pricingService.configureMargins(retailerId, req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getMargins = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const margins = await this.pricingService.getMargins(retailerId);
      res.status(200).json(margins);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}