import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.get('/', CategoryController.list);
router.post('/', authorizeRoles('Owner', 'Manager'), CategoryController.create);
router.put('/:id', authorizeRoles('Owner', 'Manager'), CategoryController.update);
router.delete('/:id', authorizeRoles('Owner', 'Manager'), CategoryController.archive);

export default router;