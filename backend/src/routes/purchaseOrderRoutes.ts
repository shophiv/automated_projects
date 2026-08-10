import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchaseOrderController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.get('/', PurchaseOrderController.list);
router.post('/', authorizeRoles('Owner', 'Manager'), PurchaseOrderController.create);
router.put('/:id/status', authorizeRoles('Owner', 'Manager'), PurchaseOrderController.updateStatus);

export default router;