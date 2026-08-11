"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router = (0, express_1.Router)();
const categoryController = new category_controller_1.CategoryController();
router.use(auth_middleware_1.verifyToken);
router.get('/', categoryController.getCategories);
router.post('/', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Category name is required'),
    validation_middleware_1.validateInput
], categoryController.createCategory);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), categoryController.updateCategory);
router.patch('/:id/archive', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), categoryController.archiveCategory);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['Owner', 'Manager']), categoryController.deleteCategory);
exports.default = router;
