import { Router } from 'express';
import { ProductController } from './productController';
import { authenticateToken } from '../auth/authMiddleware';
import { tenantContextMiddleware } from '../../middleware/tenant';

const router = Router();
const productController = new ProductController();

router.use(authenticateToken);
router.use(tenantContextMiddleware);

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/duplicate', productController.duplicateProduct);
router.patch('/:id/archive', productController.archiveProduct);

export default router;