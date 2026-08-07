import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new CategoryController();

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').optional(),
    description: z.string().optional(),
    is_archived: z.boolean().optional(),
  }),
});

router.use(authenticateJWT);

router.get('/', controller.getCategories);
router.get('/:id', controller.getCategoryById);
router.post('/', authorizeRoles('OWNER', 'MANAGER'), validateRequest(createCategorySchema), controller.createCategory);
router.put('/:id', authorizeRoles('OWNER', 'MANAGER'), validateRequest(updateCategorySchema), controller.updateCategory);
router.patch('/:id/archive', authorizeRoles('OWNER', 'MANAGER'), controller.archiveCategory);
router.delete('/:id', authorizeRoles('OWNER', 'MANAGER'), controller.deleteCategory);

export default router;