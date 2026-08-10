import { Request, Response } from 'express';
import { z } from 'zod';
import { InventoryService } from '../services/inventoryService';
import { PricingService } from '../services/pricingService';
import { BarcodeService } from '../services/barcodeService';

const adjustSchema = z.object({
  product_id: z.string().uuid('Valid product ID is required'),
  type: z.enum(['stock_in', 'stock_out', 'adjustment', 'transfer']),
  quantity_change: z.number().int('Quantity must be an integer'),
  reference: z.string().optional(),
});

const pricingConfigSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  global_profit_margin: z.number().min(0, 'Profit margin must be positive'),
});

export class InventoryController {
  static async adjustStock(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = adjustSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const result = await InventoryService.adjustStock(
        req.user.tenantId,
        req.user.userId,
        parsed.data.product_id,
        parsed.data.type,
        parsed.data.quantity_change,
        parsed.data.reference
      );

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ADJUST_FAILED', message: error.message } });
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const history = await InventoryService.getHistory(req.user.tenantId, limit, offset);
      res.status(200).json({ success: true, data: history.logs, total: history.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const alerts = await InventoryService.getAlerts(req.user.tenantId);
      res.status(200).json({ success: true, data: alerts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async lookupBarcode(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const barcode = req.query.barcode as string;
      if (!barcode) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Barcode is required' } });
        return;
      }

      const product = await BarcodeService.lookupBarcode(req.user.tenantId, barcode);
      if (!product) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found for barcode' } });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  static async generateBarcode(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const { sku } = req.body;
      if (!sku) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'SKU is required' } });
        return;
      }

      const asset = BarcodeService.generateBarcodeAsset(sku);
      res.status(200).json({ success: true, data: asset });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'GENERATE_FAILED', message: error.message } });
    }
  }

  static async updatePricingConfig(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = pricingConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const config = await PricingService.updateConfig(
        req.user.tenantId,
        parsed.data.category_id || null,
        parsed.data.global_profit_margin
      );

      res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }
}