"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
class CategoryController {
    categoryService;
    constructor() {
        this.categoryService = new category_service_1.CategoryService();
    }
    getCategories = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const categories = await this.categoryService.getCategories(tenantId);
            res.status(200).json({ success: true, data: categories });
        }
        catch (error) {
            next(error);
        }
    };
    createCategory = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const category = await this.categoryService.createCategory(tenantId, req.body);
            res.status(201).json({ success: true, message: 'Category created successfully', data: category });
        }
        catch (error) {
            next(error);
        }
    };
    updateCategory = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { id } = req.params;
            const category = await this.categoryService.updateCategory(tenantId, id, req.body);
            res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
        }
        catch (error) {
            next(error);
        }
    };
    deleteCategory = async (req, res, next) => {
        try {
            const tenantId = req.user.tenantId;
            const { id } = req.params;
            await this.categoryService.deleteCategory(tenantId, id);
            res.status(200).json({ success: true, message: 'Category deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CategoryController = CategoryController;
