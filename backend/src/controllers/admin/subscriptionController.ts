import { Request, Response } from 'express';
import { AdminService } from '../../services/adminService';

export class SubscriptionController {
  static async listSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const plans = await AdminService.listSubscriptions();
      res.status(200).json({ success: true, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async assignSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { tenant_id, subscription_id } = req.body;
      if (!tenant_id || !subscription_id) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'tenant_id and subscription_id are required' } });
        return;
      }

      const updated = await AdminService.assignSubscription(tenant_id, subscription_id);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ASSIGN_FAILED', message: error.message } });
    }
  }
}