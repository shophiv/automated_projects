"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const controller = new product_controller_1.ProductController();
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required'),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    barcode: zod_1.z.string().min(1, 'Barcode is required'),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    brand: zod_1.z.string().optional().nullable(),
    supplier_id: zod_1.z.string().uuid().optional().nullable(),
    purchase_price: zod_1.z.number().min(0, 'Purchase price must be positive'),
    selling_price: zod_1.z.number().min(0).optional(),
    wholesale_price: zod_1.z.number().min(0).optional().nullable(),
    discount_price: zod_1.z.number().min(0).optional().nullable(),
    tax_rate: zod_1.z.number().min(0).optional(),
    profit_margin: zod_1.z.number().min(0, 'Profit margin must be positive'),
    unit: zod_1.z.string().min(1, 'Unit is required'),
    quantity: zod_1.z.number().int().min(0).optional(),
    min_stock: zod_1.z.number().int().min(0).optional(),
    max_stock: zod_1.z.number().int().min(0).optional().nullable(),
    image_url: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    description: zod_1.z.string().optional().nullable(),
    active_status: zod_1.z.boolean().optional(),
});
const pricingConfigSchema = zod_1.z.object({
    global_margin: zod_1.z.number().min(0),
    category_margins_json: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
});
router.use(auth_middleware_1.authenticateJWT);
router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), (0, validation_middleware_1.validateRequest)(productSchema), controller.createProduct);
router.put('/:id', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), controller.updateProduct);
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), controller.deleteProduct);
router.post('/:id/duplicate', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), controller.duplicateProduct);
router.put('/pricing/configurations', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), (0, validation_middleware_1.validateRequest)(pricingConfigSchema), controller.updatePricingConfig);
exports.default = router;
