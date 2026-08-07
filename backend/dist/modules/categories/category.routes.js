"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const controller = new category_controller_1.CategoryController();
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
router.use(auth_middleware_1.authenticateJWT);
router.get('/', controller.getCategories);
router.post('/', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), (0, validation_middleware_1.validateRequest)(categorySchema), controller.createCategory);
router.put('/:id', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), (0, validation_middleware_1.validateRequest)(categorySchema), controller.updateCategory);
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('owner', 'manager'), controller.deleteCategory);
exports.default = router;
