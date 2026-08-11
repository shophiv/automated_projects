import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { PricingService } from '../pricing/pricing.service';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  purchase_price: z.number().min(0),
  selling_price: z.number().min(0).optional().nullable(),
  wholesale_price: z.number().min(0).optional(),
  discount_price: z.number().min(0).optional(),
  tax_rate: z.number().min(0).optional(),
  profit_margin: z.number().optional().nullable(),
  unit: z.string().optional(),
  quantity: z.number().min(0).optional(),
  min_stock: z.number().min(0).optional(),
  max_stock: z.number().min(0).optional(),
  image_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active_status: z.boolean().optional(),
});

export class ProductController {
  private productService = new ProductService();
  private pricingService = new PricingService();

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const search = req.query.search as string | undefined;
      const category_id = req.query.category_id as string | undefined;
      const archived = req.query.archived as string | undefined;

      const products = await this.productService.getProducts(tenantId, { search, category_id, archived });
      return res.status(200).json({ status: 'success', data: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const product = await this.productService.getProductById(tenantId, id);
      return res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const validation = productSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }
      const product = await this.productService.createProduct(tenantId, validation.data);
      return res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const validation = productSchema.partial().safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }
      const product = await this.productService.updateProduct(tenantId, id, validation.data);
      return res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      await this.productService.deleteProduct(tenantId, id);
      return res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  archiveProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const product = await this.productService.archiveProduct(tenantId, id);
      return res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  duplicateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const product = await this.productService.duplicateProduct(tenantId, id);
      return res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const { purchase_price, profit_margin, tax_rate, category_id } = req.body;
      if (purchase_price === undefined || purchase_price === null) {
        throw new AppError('Purchase price is required', 400);
      }

      const margin = await this.pricingService.resolveProductMargin(tenantId, category_id, profit_margin);
      const selling_price = this.pricingService.calculateSellingPrice(Number(purchase_price), margin, Number(tax_rate || 0));

      return res.status(200).json({
        status: 'success',
        data: { purchase_price, profit_margin: margin, tax_rate: tax_rate || 0, selling_price },
      });
    } catch (error) {
      next(error);
    }
  };
}