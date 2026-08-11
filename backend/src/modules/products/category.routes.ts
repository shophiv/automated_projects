import { Router } from 'express';
import { CategoryController } from './category.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const categoryController = new CategoryController();

router.use(verifyToken);

router.get('/', categoryController.getCategories);

router.post(
  '/',
  requireRole(['Owner', 'Manager']),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    validateInput
  ],
  categoryController.createCategory
);

router.put(
  '/:id',
  requireRole(['Owner', 'Manager']),
  categoryController.updateCategory
);

router.patch(
  '/:id/archive',
  requireRole(['Owner', 'Manager']),
  categoryController.archiveCategory
);

router.delete(
  '/:id',
  requireRole(['Owner', 'Manager']),
  categoryController.deleteCategory
);

export default router;