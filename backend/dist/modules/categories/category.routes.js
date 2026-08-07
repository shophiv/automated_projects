"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const controller = new category_controller_1.CategoryController();
const createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required'),
        description: zod_1.z.string().optional(),
    }),
});
const updateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required').optional(),
        description: zod_1.z.string().optional(),
        is_archived: zod_1.z.boolean().optional(),
    }),
});
router.use(auth_middleware_1.authenticateJWT);
router.get('/', controller.getCategories);
router.get('/:id', controller.getCategoryById);
router.post('/', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), (0, validation_middleware_1.validateRequest)(createCategorySchema), controller.createCategory);
router.put('/:id', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), (0, validation_middleware_1.validateRequest)(updateCategorySchema), controller.updateCategory);
router.patch('/:id/archive', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), controller.archiveCategory);
router.delete('/:id', (0, rbac_middleware_1.authorizeRoles)('OWNER', 'MANAGER'), controller.deleteCategory);
exports.default = router;
