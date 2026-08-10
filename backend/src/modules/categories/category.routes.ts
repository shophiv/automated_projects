import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CategoryController();

router.use(authenticateJWT);

router.get('/', controller.getCategories);
router.post('/', authorizeRoles('Owner', 'Manager'), controller.createCategory);
router.put('/:id', authorizeRoles('Owner', 'Manager'), controller.updateCategory);
router.delete('/:id', authorizeRoles('Owner', 'Manager'), controller.deleteCategory);

export default router;