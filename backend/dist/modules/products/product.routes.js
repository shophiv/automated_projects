"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
router.use(auth_middleware_1.verifyToken);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('sku').notEmpty().withMessage('SKU is required'),
    validation_middleware_1.validateInput
], productController.createProduct);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), productController.updateProduct);
router.patch('/:id/archive', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), productController.archiveProduct);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), productController.deleteProduct);
router.post('/:id/duplicate', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), productController.duplicateProduct);
exports.default = router;
