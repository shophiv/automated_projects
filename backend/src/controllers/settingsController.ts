import { Request, Response } from 'express';
import { z } from 'zod';
import { SettingsService } from '../services/settingsService';

const settingsUpdateSchema = z.object({
  business_name: z.string().min(2).optional(),
  owner_name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  address: z.string().min(5).optional(),
  settings_json: z.object({
    currency: z.string().optional(),
    tax_rate: z.number().min(0).optional(),
    receipt_header: z.string().optional(),
    receipt_footer: z.string().optional(),
    profit_margin_default: z.number().min(0).optional(),
  }).optional(),
});

export class SettingsController {
  static async getSettings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }
      const settings = await SettingsService.getSettings(req.user.tenantId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = settingsUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const updated = await SettingsService.updateSettings(req.user.tenantId, parsed.data);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }
}