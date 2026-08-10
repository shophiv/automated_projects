import { Router } from 'express';
import { SupplierController } from '../controllers/supplierController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.get('/', SupplierController.list);
router.post('/', authorizeRoles('Owner', 'Manager'), SupplierController.create);
router.put('/:id', authorizeRoles('Owner', 'Manager'), SupplierController.update);
router.delete('/:id', authorizeRoles('Owner'), SupplierController.delete);
router.get('/:id/reports', SupplierController.report);

export default router;