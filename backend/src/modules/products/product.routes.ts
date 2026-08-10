import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ProductController();

router.use(authenticateJWT);

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authorizeRoles('Owner', 'Manager'), controller.createProduct);
router.put('/:id', authorizeRoles('Owner', 'Manager'), controller.updateProduct);
router.delete('/:id', authorizeRoles('Owner', 'Manager'), controller.deleteProduct);
router.post('/:id/duplicate', authorizeRoles('Owner', 'Manager'), controller.duplicateProduct);

router.get('/pricing/margins', controller.getMargins);
router.put('/pricing/margins', authorizeRoles('Owner', 'Manager'), controller.updateMargins);

export default router;