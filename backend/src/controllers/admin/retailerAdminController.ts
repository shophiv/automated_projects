import { Request, Response } from 'express';
import { AdminService } from '../../services/adminService';

export class RetailerAdminController {
  static async listRetailers(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const retailers = await AdminService.listRetailers(search, status);
      res.status(200).json({ success: true, data: retailers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !['active', 'suspended', 'pending'].includes(status)) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid status required (active, suspended, pending)' } });
        return;
      }

      const updated = await AdminService.updateRetailerStatus(id, status);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }
}