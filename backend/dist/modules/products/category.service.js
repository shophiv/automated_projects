"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("./category.repository");
class CategoryService {
    categoryRepository = new category_repository_1.CategoryRepository();
    async createCategory(retailerId, data) {
        if (!data.name) {
            throw new Error('Category name is required');
        }
        return await this.categoryRepository.create(retailerId, data);
    }
    async getCategories(retailerId) {
        return await this.categoryRepository.findAll(retailerId);
    }
    async updateCategory(categoryId, retailerId, data) {
        const existing = await this.categoryRepository.findById(categoryId, retailerId);
        if (!existing) {
            throw new Error('Category not found');
        }
        return await this.categoryRepository.update(categoryId, retailerId, data);
    }
    async archiveCategory(categoryId, retailerId) {
        const existing = await this.categoryRepository.findById(categoryId, retailerId);
        if (!existing) {
            throw new Error('Category not found');
        }
        return await this.categoryRepository.update(categoryId, retailerId, { status: 'archived' });
    }
    async deleteCategory(categoryId, retailerId) {
        const existing = await this.categoryRepository.findById(categoryId, retailerId);
        if (!existing) {
            throw new Error('Category not found');
        }
        return await this.categoryRepository.delete(categoryId, retailerId);
    }
}
exports.CategoryService = CategoryService;
