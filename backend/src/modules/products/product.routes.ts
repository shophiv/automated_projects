import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new ProductController();

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  category_id: z.string().uuid().optional().nullable(),
  brand: z.string().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  purchase_price: z.number().min(0, 'Purchase price must be positive'),
  selling_price: z.number().min(0).optional(),
  wholesale_price: z.number().min(0).optional().nullable(),
  discount_price: z.number().min(0).optional().nullable(),
  tax_rate: z.number().min(0).optional(),
  profit_margin: z.number().min(0, 'Profit margin must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.number().int().min(0).optional(),
  min_stock: z.number().int().min(0).optional(),
  max_stock: z.number().int().min(0).optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable(),
  active_status: z.boolean().optional(),
});

const pricingConfigSchema = z.object({
  global_margin: z.number().min(0),
  category_margins_json: z.record(z.string(), z.number()).optional(),
});

router.use(authenticateJWT);

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authorizeRoles('owner', 'manager'), validateRequest(productSchema), controller.createProduct);
router.put('/:id', authorizeRoles('owner', 'manager'), controller.updateProduct);
router.delete('/:id', authorizeRoles('owner', 'manager'), controller.deleteProduct);
router.post('/:id/duplicate', authorizeRoles('owner', 'manager'), controller.duplicateProduct);
router.put('/pricing/configurations', authorizeRoles('owner', 'manager'), validateRequest(pricingConfigSchema), controller.updatePricingConfig);

export default router;