import { Router } from 'express';
import { PosController } from '../controllers/posController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.post('/checkout', authorizeRoles('Owner', 'Manager', 'Cashier'), PosController.checkout);

export default router;