"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("./category.repository");
class CategoryService {
    categoryRepo = new category_repository_1.CategoryRepository();
    async getCategories(tenantId, includeArchived = false) {
        return await this.categoryRepo.findAll(tenantId, includeArchived);
    }
    async getCategoryById(id, tenantId) {
        const category = await this.categoryRepo.findById(id, tenantId);
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }
    async createCategory(tenantId, data) {
        const existing = await this.categoryRepo.findByName(data.name, tenantId);
        if (existing) {
            throw new Error('Category with this name already exists');
        }
        return await this.categoryRepo.create({ tenantId, ...data });
    }
    async updateCategory(id, tenantId, data) {
        await this.getCategoryById(id, tenantId);
        if (data.name) {
            const existing = await this.categoryRepo.findByName(data.name, tenantId);
            if (existing && existing.id !== id) {
                throw new Error('Another category with this name already exists');
            }
        }
        await this.categoryRepo.update(id, tenantId, data);
        return await this.getCategoryById(id, tenantId);
    }
    async archiveCategory(id, tenantId) {
        await this.getCategoryById(id, tenantId);
        await this.categoryRepo.update(id, tenantId, { is_archived: true });
        return { message: 'Category archived successfully' };
    }
    async deleteCategory(id, tenantId) {
        const category = await this.getCategoryById(id, tenantId);
        if (category.products && category.products.length > 0) {
            throw new Error('Cannot delete category containing products. Archive it instead.');
        }
        await this.categoryRepo.delete(id, tenantId);
        return { message: 'Category deleted successfully' };
    }
}
exports.CategoryService = CategoryService;
