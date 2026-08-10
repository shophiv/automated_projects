import { Request, Response } from 'express';
import { SalesService } from '../services/salesService';

export class SalesController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const result = await SalesService.getSales(
        req.user.tenantId,
        { search, status, startDate, endDate },
        limit,
        offset
      );

      res.status(200).json({ success: true, data: result.sales, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const sale = await SalesService.getSaleById(req.user.tenantId, req.params.id);
      res.status(200).json({ success: true, data: sale });
    } catch (error: any) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
  }

  static async refund(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const refundSale = await SalesService.refundSale(req.user.tenantId, req.user.userId, req.params.id);
      res.status(200).json({ success: true, data: refundSale, message: 'Sale refunded and stock restored successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REFUND_FAILED', message: error.message } });
    }
  }
}