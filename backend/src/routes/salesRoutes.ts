import { Router } from 'express';
import { SalesController } from '../controllers/salesController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.get('/', authorizeRoles('Owner', 'Manager', 'Cashier'), SalesController.list);
router.get('/:id', authorizeRoles('Owner', 'Manager', 'Cashier'), SalesController.getById);
router.post('/:id/refund', authorizeRoles('Owner', 'Manager'), SalesController.refund);

export default router;