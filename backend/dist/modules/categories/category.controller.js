"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
class CategoryController {
    categoryService = new category_service_1.CategoryService();
    getCategories = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const includeArchived = req.query.includeArchived === 'true';
            const categories = await this.categoryService.getCategories(tenantId, includeArchived);
            return res.status(200).json({ status: 'success', data: categories });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    getCategoryById = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const category = await this.categoryService.getCategoryById(req.params.id, tenantId);
            return res.status(200).json({ status: 'success', data: category });
        }
        catch (error) {
            return res.status(404).json({ status: 'error', code: 404, message: error.message });
        }
    };
    createCategory = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const category = await this.categoryService.createCategory(tenantId, req.body);
            return res.status(201).json({ status: 'success', data: category });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    updateCategory = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const category = await this.categoryService.updateCategory(req.params.id, tenantId, req.body);
            return res.status(200).json({ status: 'success', data: category });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    archiveCategory = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const result = await this.categoryService.archiveCategory(req.params.id, tenantId);
            return res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    deleteCategory = async (req, res) => {
        try {
            const tenantId = req.user?.tenant_id;
            const result = await this.categoryService.deleteCategory(req.params.id, tenantId);
            return res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
}
exports.CategoryController = CategoryController;
