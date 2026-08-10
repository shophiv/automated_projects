import { Request, Response } from 'express';
import { z } from 'zod';
import { PosService } from '../services/posService';

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid('Valid product ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Cart cannot be empty'),
  customer_name: z.string().optional(),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'split']),
  discount_amount: z.number().min(0).optional(),
  tax_rate: z.number().min(0).optional(),
});

export class PosController {
  static async checkout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const transaction = await PosService.checkout(req.user.tenantId, req.user.userId, parsed.data);
      res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CHECKOUT_FAILED', message: error.message } });
    }
  }
}