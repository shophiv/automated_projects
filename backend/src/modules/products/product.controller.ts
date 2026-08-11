import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ProductService } from './product.service';

export class ProductController {
  private productService = new ProductService();

  createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const product = await this.productService.createProduct(retailerId, req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const products = await this.productService.getProducts(retailerId, req.query);
      res.status(200).json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.getProductById(productId, retailerId);
      res.status(200).json(product);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.updateProduct(productId, retailerId, req.body);
      res.status(200).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  archiveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.archiveProduct(productId, retailerId);
      res.status(200).json(product);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const productId = parseInt(req.params.id, 10);
      await this.productService.deleteProduct(productId, retailerId);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  duplicateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const productId = parseInt(req.params.id, 10);
      const product = await this.productService.duplicateProduct(productId, retailerId);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}