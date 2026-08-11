import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ProductController();

router.use(authenticate, authorize(['OWNER', 'MANAGER', 'CASHIER']));

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authorize(['OWNER', 'MANAGER']), controller.createProduct);
router.put('/:id', authorize(['OWNER', 'MANAGER']), controller.updateProduct);
router.delete('/:id', authorize(['OWNER', 'MANAGER']), controller.deleteProduct);
router.patch('/:id/archive', authorize(['OWNER', 'MANAGER']), controller.archiveProduct);
router.post('/:id/duplicate', authorize(['OWNER', 'MANAGER']), controller.duplicateProduct);
router.post('/calculate-price', controller.calculatePrice);

export const productRoutes = router;