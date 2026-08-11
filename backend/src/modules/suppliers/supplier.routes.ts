import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const supplierController = new SupplierController();

router.use(verifyToken);

router.get('/', supplierController.getSuppliers);

router.post(
  '/',
  requireRole(['Owner', 'Manager']),
  [
    body('businessName').notEmpty().withMessage('Business name is required'),
    validateInput
  ],
  supplierController.createSupplier
);

router.put(
  '/:id',
  requireRole(['Owner', 'Manager']),
  supplierController.updateSupplier
);

router.patch(
  '/:id/deactivate',
  requireRole(['Owner', 'Manager']),
  supplierController.deactivateSupplier
);

router.delete(
  '/:id',
  requireRole(['Owner', 'Manager']),
  supplierController.deleteSupplier
);

router.get('/:id/reports', supplierController.getSupplierReports);

export default router;