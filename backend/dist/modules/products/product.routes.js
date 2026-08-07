"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const controller = new product_controller_1.ProductController();
const productBodySchema = zod_1.z.object({
    category_id: zod_1.z.string().min(1, 'Category is required'),
    name: zod_1.z.string().min(1, 'Product name is required'),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    barcode: zod_1.z.string().min(1, 'Barcode is required'),
    brand: zod_1.z.string().optional(),
    purchase_price: zod_1.z.number().min(0, 'Purchase price must be >= 0'),
    selling_price: zod_1.z.number().min(0, 'Selling price must be >= 0'),
    wholesale_price: zod_1.z.number().min(0).optional(),
    discount_price: zod_1.z.number().min(0).optional(),
    tax_rate: zod_1.z.number().min(0).optional(),
    unit: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().min(0).optional(),
    min_stock: zod_1.z.number().int().min(0).optional(),
    max_stock: zod_1.z.number().int().min(0).optional(),
    image_url: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
const createProductSchema = zod_1.z.object({ body: productBodySchema });
const updateProductSchema = zod_1.z.object({ body: productBodySchema.partial() });
router.use(auth_middleware_1.authenticateJWT);
router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), (0, validation_middleware_1.validateRequest)(createProductSchema), controller.createProduct);
router.put('/:id', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), (0, validation_middleware_1.validateRequest)(updateProductSchema), controller.updateProduct);
router.patch('/:id/archive', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), controller.archiveProduct);
router.delete('/:id', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), controller.deleteProduct);
router.post('/:id/duplicate', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), controller.duplicateProduct);
exports.default = router;
