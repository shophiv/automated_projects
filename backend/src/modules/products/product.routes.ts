import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new ProductController();

const productBodySchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  brand: z.string().optional(),
  purchase_price: z.number().min(0, 'Purchase price must be >= 0'),
  selling_price: z.number().min(0, 'Selling price must be >= 0'),
  wholesale_price: z.number().min(0).optional(),
  discount_price: z.number().min(0).optional(),
  tax_rate: z.number().min(0).optional(),
  unit: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  min_stock: z.number().int().min(0).optional(),
  max_stock: z.number().int().min(0).optional(),
  image_url: z.string().optional(),
  description: z.string().optional(),
});

const createProductSchema = z.object({ body: productBodySchema });
const updateProductSchema = z.object({ body: productBodySchema.partial() });

router.use(authenticateJWT);

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authorizeRoles('OWNER', 'MANAGER'), validateRequest(createProductSchema), controller.createProduct);
router.put('/:id', authorizeRoles('OWNER', 'MANAGER'), validateRequest(updateProductSchema), controller.updateProduct);
router.patch('/:id/archive', authorizeRoles('OWNER', 'MANAGER'), controller.archiveProduct);
router.delete('/:id', authorizeRoles('OWNER', 'MANAGER'), controller.deleteProduct);
router.post('/:id/duplicate', authorizeRoles('OWNER', 'MANAGER'), controller.duplicateProduct);

export default router;