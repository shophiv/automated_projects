import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { PredictionService } from '../services/predictionService';

export class AnalyticsController {
  static async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const interval = (req.query.interval as 'daily' | 'weekly' | 'monthly') || 'daily';
      const analytics = await AnalyticsService.getSalesAnalytics(req.user.tenantId, interval);

      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async getPredictions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const predictions = await PredictionService.generateForecasts(req.user.tenantId);
      res.status(200).json({ success: true, data: predictions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }
}