import { Router } from 'express';
import { ProductController } from './product.controller';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { body } from 'express-validator';
import { validateInput } from '../../middleware/validation.middleware';

const router = Router();
const productController = new ProductController();

router.use(verifyToken);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  requireRole(['Owner', 'Manager']),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    validateInput
  ],
  productController.createProduct
);

router.put(
  '/:id',
  requireRole(['Owner', 'Manager']),
  productController.updateProduct
);

router.patch(
  '/:id/archive',
  requireRole(['Owner', 'Manager']),
  productController.archiveProduct
);

router.delete(
  '/:id',
  requireRole(['Owner', 'Manager']),
  productController.deleteProduct
);

router.post(
  '/:id/duplicate',
  requireRole(['Owner', 'Manager']),
  productController.duplicateProduct
);

export default router;