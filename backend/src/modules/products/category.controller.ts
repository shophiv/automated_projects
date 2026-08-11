import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CategoryService } from './category.service';

export class CategoryController {
  private categoryService = new CategoryService();

  createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const category = await this.categoryService.createCategory(retailerId, req.body);
      res.status(201).json(category);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const categories = await this.categoryService.getCategories(retailerId);
      res.status(200).json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const categoryId = parseInt(req.params.id, 10);
      const category = await this.categoryService.updateCategory(categoryId, retailerId, req.body);
      res.status(200).json(category);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  archiveCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const categoryId = parseInt(req.params.id, 10);
      const category = await this.categoryService.archiveCategory(categoryId, retailerId);
      res.status(200).json(category);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const categoryId = parseInt(req.params.id, 10);
      await this.categoryService.deleteCategory(categoryId, retailerId);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}