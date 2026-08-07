import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new CategoryController();

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  status: z.string().optional(),
});

router.use(authenticateJWT);

router.get('/', controller.getCategories);
router.post('/', authorizeRoles('owner', 'manager'), validateRequest(categorySchema), controller.createCategory);
router.put('/:id', authorizeRoles('owner', 'manager'), validateRequest(categorySchema), controller.updateCategory);
router.delete('/:id', authorizeRoles('owner', 'manager'), controller.deleteCategory);

export default router;