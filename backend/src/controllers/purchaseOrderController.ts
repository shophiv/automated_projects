import { Request, Response } from 'express';
import { z } from 'zod';
import { PurchaseOrderService } from '../services/purchaseOrderService';

const poSchema = z.object({
  supplier_id: z.string().uuid('Valid supplier ID is required'),
  expected_delivery_date: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.string().uuid('Valid product ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      unit_cost: z.number().min(0, 'Unit cost must be positive'),
    })
  ).min(1, 'Purchase order must have at least one item'),
});

const statusSchema = z.object({
  status: z.enum(['draft', 'submitted', 'approved', 'received', 'completed', 'cancelled']),
});

export class PurchaseOrderController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }
      const orders = await PurchaseOrderService.getPurchaseOrders(req.user.tenantId);
      res.status(200).json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = poSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const po = await PurchaseOrderService.createPurchaseOrder(req.user.tenantId, parsed.data);
      res.status(201).json({ success: true, data: po });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const po = await PurchaseOrderService.updateStatus(
        req.user.tenantId,
        req.user.userId,
        req.params.id,
        parsed.data.status
      );

      res.status(200).json({ success: true, data: po });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }
}