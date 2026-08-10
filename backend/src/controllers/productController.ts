import { Request, Response } from 'express';
import { z } from 'zod';
import { ProductService } from '../services/productService';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category_id: z.string().uuid().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  barcode: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  purchase_price: z.number().min(0, 'Purchase price must be positive'),
  selling_price: z.number().min(0, 'Selling price must be positive'),
  profit_margin: z.number().optional().default(0),
  tax_rate: z.number().optional().default(0),
  unit: z.string().optional().default('pcs'),
  quantity: z.number().int().min(0).optional().default(0),
  min_stock: z.number().int().min(0).optional().default(5),
  max_stock: z.number().int().min(0).optional().default(100),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable(),
  active_status: z.boolean().optional().default(true),
});

export class ProductController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const search = req.query.search as string | undefined;
      const categoryId = req.query.category_id as string | undefined;
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const result = await ProductService.getProducts(req.user.tenantId, search, categoryId, limit, offset);
      res.status(200).json({ success: true, data: result.products, total: result.total });
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

      const parsed = productSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const product = await ProductService.createProduct(req.user.tenantId, parsed.data);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const parsed = productSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const product = await ProductService.updateProduct(req.user.tenantId, req.params.id, parsed.data);
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  static async archive(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      await ProductService.archiveProduct(req.user.tenantId, req.params.id);
      res.status(200).json({ success: true, message: 'Product archived successfully' });
    } catch (error: any) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
  }

  static async duplicate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const product = await ProductService.duplicateProduct(req.user.tenantId, req.params.id);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
  }
}