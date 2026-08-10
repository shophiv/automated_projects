import { Request, Response } from 'express';
import { z } from 'zod';
import { CategoryService } from '../services/categoryService';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export class CategoryController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }
      const categories = await CategoryService.getCategories(req.user.tenantId);
      res.status(200).json({ success: true, data: categories });
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

      const parsed = categorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const category = await CategoryService.createCategory(req.user.tenantId, parsed.data);
      res.status(201).json({ success: true, data: category });
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

      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const category = await CategoryService.updateCategory(req.user.tenantId, req.params.id, parsed.data);
      res.status(200).json({ success: true, data: category });
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

      await CategoryService.archiveCategory(req.user.tenantId, req.params.id);
      res.status(200).json({ success: true, message: 'Category archived successfully' });
    } catch (error: any) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
  }
}