import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AnalyticsService } from './analytics.service';
import { PredictionService } from './prediction.service';

export class AnalyticsController {
  private analyticsService = new AnalyticsService();
  private predictionService = new PredictionService();

  getSalesHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const history = await this.analyticsService.getSalesHistory(retailerId, req.query);
      res.status(200).json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  exportSalesStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const format = (req.query.format as string) || 'json';
      const exportResult = await this.analyticsService.exportSalesStatistics(retailerId, req.query, format);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
        res.status(200).send(exportResult.data);
      } else {
        res.status(200).json(exportResult);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getSaleById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const saleId = parseInt(req.params.id, 10);
      const sale = await this.analyticsService.getSaleById(retailerId, saleId);
      res.status(200).json(sale);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  processRefund = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const saleId = parseInt(req.params.id, 10);
      const result = await this.analyticsService.processRefund(retailerId, saleId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  reprintInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const saleId = parseInt(req.params.id, 10);
      const result = await this.analyticsService.reprintInvoice(retailerId, saleId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  getSalesAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const timeframe = req.query.timeframe as string;
      const analytics = await this.analyticsService.getSalesAnalytics(retailerId, timeframe);
      res.status(200).json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getSalesPredictions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const predictions = await this.predictionService.getPredictions(retailerId);
      res.status(200).json(predictions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
5    }
  };
}