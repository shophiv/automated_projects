import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ProductService } from './product.service';
import { PricingService } from '../pricing/pricing.service';
import { z } from 'zod';

const productSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0).optional(),
  wholesalePrice: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  taxRate: z.number().min(0).optional(),
  unit: z.string().optional(),
  quantity: z.number().int().min(0),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

const marginSchema = z.object({
  margin: z.number().min(0).max(1000),
});

export class ProductController {
  private productService = new ProductService();
  private pricingService = new PricingService();

  getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const products = await this.productService.getProducts(req.user!.retailerId, search, categoryId);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getProductById(req.params.id, req.user!.retailerId);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = productSchema.parse(req.body);
      const product = await this.productService.createProduct(req.user!.retailerId, validated);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = productSchema.partial().parse(req.body);
      const product = await this.productService.updateProduct(req.params.id, req.user!.retailerId, validated);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.productService.deleteProduct(req.params.id, req.user!.retailerId);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  duplicateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.duplicateProduct(req.params.id, req.user!.retailerId);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  updateMargins = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = marginSchema.parse(req.body);
      const settings = await this.pricingService.updateMarginSettings(req.user!.retailerId, validated.margin);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  getMargins = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settings = await this.pricingService.getMarginSettings(req.user!.retailerId);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };
}