import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CategoryController();

router.use(authenticate, authorize(['OWNER', 'MANAGER', 'CASHIER']));

router.get('/', controller.getCategories);
router.post('/', authorize(['OWNER', 'MANAGER']), controller.createCategory);
router.put('/:id', authorize(['OWNER', 'MANAGER']), controller.updateCategory);
router.patch('/:id/archive', authorize(['OWNER', 'MANAGER']), controller.archiveCategory);
router.delete('/:id', authorize(['OWNER', 'MANAGER']), controller.deleteCategory);

export const categoryRoutes = router;