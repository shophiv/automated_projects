import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SupplierService } from './supplier.service';

export class SupplierController {
  private supplierService = new SupplierService();

  createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const supplier = await this.supplierService.createSupplier(retailerId, req.body);
      res.status(201).json(supplier);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const suppliers = await this.supplierService.getSuppliers(retailerId);
      res.status(200).json(suppliers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const supplierId = parseInt(req.params.id, 10);
      const supplier = await this.supplierService.updateSupplier(supplierId, retailerId, req.body);
      res.status(200).json(supplier);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  deactivateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const supplierId = parseInt(req.params.id, 10);
      const supplier = await this.supplierService.deactivateSupplier(supplierId, retailerId);
      res.status(200).json(supplier);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const supplierId = parseInt(req.params.id, 10);
      await this.supplierService.deleteSupplier(supplierId, retailerId);
      res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getSupplierReports = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const retailerId = req.user!.retailerId;
      const supplierId = parseInt(req.params.id, 10);
      const report = await this.supplierService.getSupplierReports(supplierId, retailerId);
      res.status(200).json(report);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };
}