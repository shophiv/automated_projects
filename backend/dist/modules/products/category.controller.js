"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
class CategoryController {
    categoryService = new category_service_1.CategoryService();
    createCategory = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const category = await this.categoryService.createCategory(retailerId, req.body);
            res.status(201).json(category);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getCategories = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const categories = await this.categoryService.getCategories(retailerId);
            res.status(200).json(categories);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    updateCategory = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const categoryId = parseInt(req.params.id, 10);
            const category = await this.categoryService.updateCategory(categoryId, retailerId, req.body);
            res.status(200).json(category);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    archiveCategory = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const categoryId = parseInt(req.params.id, 10);
            const category = await this.categoryService.archiveCategory(categoryId, retailerId);
            res.status(200).json(category);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    deleteCategory = async (req, res) => {
        try {
            const retailerId = req.user.retailerId;
            const categoryId = parseInt(req.params.id, 10);
            await this.categoryService.deleteCategory(categoryId, retailerId);
            res.status(200).json({ message: 'Category deleted successfully' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.CategoryController = CategoryController;
