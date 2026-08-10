import { Request, Response } from 'express';
import { z } from 'zod';
import { AccountingService } from '../services/accountingService';

const expenseSchema = z.object({
  category: z.enum(['Rent', 'Utilities', 'Salary', 'Transportation', 'Marketing', 'Maintenance', 'Taxes', 'Miscellaneous']),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  description: z.string().optional(),
  date: z.string().optional(),
});

export class AccountingController {
  static async listEntries(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);
      const type = req.query.type as string | undefined;

      const result = await AccountingService.getEntries(req.user.tenantId, limit, offset, type);
      res.status(200).json({ success: true, data: result.entries, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async recordExpense(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = expenseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const entry = await AccountingService.recordExpense(req.user.tenantId, parsed.data);
      res.status(201).json({ success: true, data: entry });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const summary = await AccountingService.getSummary(req.user.tenantId, startDate, endDate);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }
}