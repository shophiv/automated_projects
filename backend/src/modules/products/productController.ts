import { Response } from 'express';
import { ProductService } from './productService';
import { AuthRequest } from '../auth/authMiddleware';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const products = await this.productService.getProducts(tenantId);
      res.status(200).json({ status: 'success', data: products });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'FETCH_PRODUCTS_FAILED', message: error.message } });
    }
  };

  public createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const { sku, name, price, cost } = req.body;
      if (!sku || !name || price === undefined || cost === undefined) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'SKU, name, price, and cost are required.' } });
        return;
      }
      const product = await this.productService.createProduct(tenantId, req.body);
      res.status(201).json({ status: 'success', data: product });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'CREATE_PRODUCT_FAILED', message: error.message } });
    }
  };

  public updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.updateProduct(tenantId, productId, req.body);
      res.status(200).json({ status: 'success', data: product });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'UPDATE_PRODUCT_FAILED', message: error.message } });
    }
  };

  public deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const productId = parseInt(req.params.id, 10);
      await this.productService.deleteProduct(tenantId, productId);
      res.status(200).json({ status: 'success', data: { message: 'Product deleted successfully.' } });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'DELETE_PRODUCT_FAILED', message: error.message } });
    }
  };

  public duplicateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.duplicateProduct(tenantId, productId);
      res.status(201).json({ status: 'success', data: product });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'DUPLICATE_PRODUCT_FAILED', message: error.message } });
    }
  };

  public archiveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.archiveProduct(tenantId, productId);
      res.status(200).json({ status: 'success', data: product });
    } catch (error: any) {
      res.status(400).json({ error: { code: 'ARCHIVE_PRODUCT_FAILED', message: error.message } });
    }
  };
}