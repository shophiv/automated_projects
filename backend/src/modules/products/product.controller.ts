import { Response } from 'express';
import { ProductService } from './product.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class ProductController {
  private productService = new ProductService();

  getProducts = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const category_id = req.query.category_id as string | undefined;
      const search = req.query.search as string | undefined;
      const is_archived = req.query.is_archived === 'true' ? true : req.query.is_archived === 'false' ? false : undefined;

      const products = await this.productService.getProducts(tenantId, { category_id, search, is_archived });
      return res.status(200).json({ status: 'success', data: products });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  getProductById = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const product = await this.productService.getProductById(req.params.id, tenantId);
      return res.status(200).json({ status: 'success', data: product });
    } catch (error: any) {
      return res.status(404).json({ status: 'error', code: 404, message: error.message });
    }
  };

  createProduct = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const product = await this.productService.createProduct(tenantId, req.body);
      return res.status(201).json({ status: 'success', data: product });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  updateProduct = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const product = await this.productService.updateProduct(req.params.id, tenantId, req.body);
      return res.status(200).json({ status: 'success', data: product });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  archiveProduct = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const result = await this.productService.archiveProduct(req.params.id, tenantId);
      return res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const result = await this.productService.deleteProduct(req.params.id, tenantId);
      return res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };

  duplicateProduct = async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = req.user?.tenant_id!;
      const product = await this.productService.duplicateProduct(req.params.id, tenantId);
      return res.status(201).json({ status: 'success', data: product });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }
  };
}