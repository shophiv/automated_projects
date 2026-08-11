import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  profit_margin: z.number().optional(),
});

export class CategoryController {
  private categoryService = new CategoryService();

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const categories = await this.categoryService.getCategories(tenantId);
      return res.status(200).json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const validation = categorySchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }
      const category = await this.categoryService.createCategory(tenantId, validation.data);
      return res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const validation = categorySchema.partial().safeParse(req.body);
      if (!validation.success) {
        throw new AppError('Validation failed', 400, validation.error.errors);
      }
      const category = await this.categoryService.updateCategory(tenantId, id, validation.data);
      return res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  };

  archiveCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      const category = await this.categoryService.archiveCategory(tenantId, id);
      return res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenant_id;
      const { id } = req.params;
      if (!tenantId) {
        throw new AppError('Tenant context missing', 400);
      }
      await this.categoryService.deleteCategory(tenantId, id);
      return res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}