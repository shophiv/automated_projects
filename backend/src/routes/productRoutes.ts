import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJwt);

router.get('/', ProductController.list);
router.post('/', authorizeRoles('Owner', 'Manager'), ProductController.create);
router.put('/:id', authorizeRoles('Owner', 'Manager'), ProductController.update);
router.delete('/:id', authorizeRoles('Owner', 'Manager'), ProductController.archive);
router.post('/:id/duplicate', authorizeRoles('Owner', 'Manager'), ProductController.duplicate);

export default router;