"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const zod_1 = require("zod");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    archived: zod_1.z.boolean().optional(),
});
class CategoryController {
    categoryService = new category_service_1.CategoryService();
    getCategories = async (req, res, next) => {
        try {
            const categories = await this.categoryService.getCategories(req.user.retailerId);
            res.status(200).json({ success: true, data: categories });
        }
        catch (error) {
            next(error);
        }
    };
    createCategory = async (req, res, next) => {
        try {
            const validated = categorySchema.parse(req.body);
            const category = await this.categoryService.createCategory(req.user.retailerId, validated);
            res.status(201).json({ success: true, data: category });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    updateCategory = async (req, res, next) => {
        try {
            const validated = categorySchema.parse(req.body);
            const category = await this.categoryService.updateCategory(req.params.id, req.user.retailerId, validated);
            res.status(200).json({ success: true, data: category });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
            }
            next(error);
        }
    };
    deleteCategory = async (req, res, next) => {
        try {
            await this.categoryService.deleteCategory(req.params.id, req.user.retailerId);
            res.status(200).json({ success: true, message: 'Category deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CategoryController = CategoryController;
