"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const categoryRepository_1 = require("../repositories/categoryRepository");
class CategoryService {
    static async createCategory(tenantId, data) {
        return categoryRepository_1.CategoryRepository.create(tenantId, data);
    }
    static async getCategories(tenantId) {
        return categoryRepository_1.CategoryRepository.findAll(tenantId);
    }
    static async updateCategory(tenantId, id, data) {
        const category = await categoryRepository_1.CategoryRepository.update(tenantId, id, data);
        if (!category) {
            throw new Error('Category not found.');
        }
        return category;
    }
    static async archiveCategory(tenantId, id) {
        const success = await categoryRepository_1.CategoryRepository.archive(tenantId, id);
        if (!success) {
            throw new Error('Category not found.');
        }
    }
}
exports.CategoryService = CategoryService;
