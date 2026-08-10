"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("./category.repository");
class CategoryService {
    categoryRepo = new category_repository_1.CategoryRepository();
    async getCategories(retailerId) {
        return await this.categoryRepo.findAllByRetailer(retailerId);
    }
    async createCategory(retailerId, data) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        try {
            return await this.categoryRepo.create({
                retailerId,
                name: data.name,
                slug,
                description: data.description,
            });
        }
        catch (error) {
            if (error.code === '23505') {
                const err = new Error('Category with this name already exists');
                err.statusCode = 400;
                err.code = 'DUPLICATE_CATEGORY';
                throw err;
            }
            throw error;
        }
    }
    async updateCategory(id, retailerId, data) {
        const existing = await this.categoryRepo.findById(id, retailerId);
        if (!existing) {
            const err = new Error('Category not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        try {
            return await this.categoryRepo.update(id, retailerId, {
                name: data.name,
                slug,
                description: data.description,
                archived: data.archived,
            });
        }
        catch (error) {
            if (error.code === '23505') {
                const err = new Error('Category with this name already exists');
                err.statusCode = 400;
                err.code = 'DUPLICATE_CATEGORY';
                throw err;
            }
            throw error;
        }
    }
    async deleteCategory(id, retailerId) {
        const existing = await this.categoryRepo.findById(id, retailerId);
        if (!existing) {
            const err = new Error('Category not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return await this.categoryRepo.delete(id, retailerId);
    }
}
exports.CategoryService = CategoryService;
