"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const zod_1 = require("zod");
const categoryService_1 = require("../services/categoryService");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Category name is required'),
    description: zod_1.z.string().optional(),
});
const updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
class CategoryController {
    static async list(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const categories = await categoryService_1.CategoryService.getCategories(req.user.tenantId);
            res.status(200).json({ success: true, data: categories });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
        }
    }
    static async create(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = categorySchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const category = await categoryService_1.CategoryService.createCategory(req.user.tenantId, parsed.data);
            res.status(201).json({ success: true, data: category });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
        }
    }
    static async update(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const parsed = updateCategorySchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
                return;
            }
            const category = await categoryService_1.CategoryService.updateCategory(req.user.tenantId, req.params.id, parsed.data);
            res.status(200).json({ success: true, data: category });
        }
        catch (error) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
        }
    }
    static async archive(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            await categoryService_1.CategoryService.archiveCategory(req.user.tenantId, req.params.id);
            res.status(200).json({ success: true, message: 'Category archived successfully' });
        }
        catch (error) {
            res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        }
    }
}
exports.CategoryController = CategoryController;
