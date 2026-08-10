import { Request, Response } from 'express';
import { z } from 'zod';
import { SupplierService } from '../services/supplierService';

const supplierSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export class SupplierController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }
      const suppliers = await SupplierService.getSuppliers(req.user.tenantId);
      res.status(200).json({ success: true, data: suppliers });
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

      const parsed = supplierSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const supplier = await SupplierService.createSupplier(req.user.tenantId, parsed.data);
      res.status(201).json({ success: true, data: supplier });
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

      const parsed = supplierSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
        return;
      }

      const supplier = await SupplierService.updateSupplier(req.user.tenantId, req.params.id, parsed.data);
      res.status(200).json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      await SupplierService.deleteSupplier(req.user.tenantId, req.params.id);
      res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error: any) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
  }

  static async report(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }

      const report = await SupplierService.getSupplierReport(req.user.tenantId, req.params.id);
      res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
    }
  }
}