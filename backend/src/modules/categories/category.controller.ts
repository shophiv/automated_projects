import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CategoryService } from './category.service';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  archived: z.boolean().optional(),
});

export class CategoryController {
  private categoryService = new CategoryService();

  getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getCategories(req.user!.retailerId);
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = categorySchema.parse(req.body);
      const category = await this.categoryService.createCategory(req.user!.retailerId, validated);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = categorySchema.parse(req.body);
      const category = await this.categoryService.updateCategory(req.params.id, req.user!.retailerId, validated);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      next(error);
    }
  };

  deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.categoryService.deleteCategory(req.params.id, req.user!.retailerId);
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}