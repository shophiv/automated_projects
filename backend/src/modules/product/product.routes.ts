import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.get('/categories', productController.getCategories);
router.post('/categories', requireRole(['admin']), productController.createCategory);
router.put('/categories/:id', requireRole(['admin']), productController.updateCategory);
router.delete('/categories/:id', requireRole(['admin']), productController.deleteCategory);

router.get('/products/barcode/:barcode', productController.getProductByBarcode);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', requireRole(['admin']), productController.createProduct);
router.put('/products/:id', requireRole(['admin']), productController.updateProduct);
router.delete('/products/:id', requireRole(['admin']), productController.deleteProduct);

export default router;