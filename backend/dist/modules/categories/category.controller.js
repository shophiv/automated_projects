"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const zod_1 = require("zod");
const AppError_1 = require("../../shared/errors/AppError");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    profit_margin: zod_1.z.number().optional(),
});
class CategoryController {
    categoryService = new category_service_1.CategoryService();
    getCategories = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const categories = await this.categoryService.getCategories(tenantId);
            return res.status(200).json({ status: 'success', data: categories });
        }
        catch (error) {
            next(error);
        }
    };
    createCategory = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const validation = categorySchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            const category = await this.categoryService.createCategory(tenantId, validation.data);
            return res.status(201).json({ status: 'success', data: category });
        }
        catch (error) {
            next(error);
        }
    };
    updateCategory = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const validation = categorySchema.partial().safeParse(req.body);
            if (!validation.success) {
                throw new AppError_1.AppError('Validation failed', 400, validation.error.errors);
            }
            const category = await this.categoryService.updateCategory(tenantId, id, validation.data);
            return res.status(200).json({ status: 'success', data: category });
        }
        catch (error) {
            next(error);
        }
    };
    archiveCategory = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            const category = await this.categoryService.archiveCategory(tenantId, id);
            return res.status(200).json({ status: 'success', data: category });
        }
        catch (error) {
            next(error);
        }
    };
    deleteCategory = async (req, res, next) => {
        try {
            const tenantId = req.user?.tenant_id;
            const { id } = req.params;
            if (!tenantId) {
                throw new AppError_1.AppError('Tenant context missing', 400);
            }
            await this.categoryService.deleteCategory(tenantId, id);
            return res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CategoryController = CategoryController;
