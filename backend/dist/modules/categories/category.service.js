"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("./category.repository");
class CategoryService {
    categoryRepo;
    constructor() {
        this.categoryRepo = new category_repository_1.CategoryRepository();
    }
    async getCategories(tenantId) {
        return await this.categoryRepo.findAll(tenantId);
    }
    async createCategory(tenantId, data) {
        return await this.categoryRepo.create(tenantId, data.name, data.description, data.status);
    }
    async updateCategory(tenantId, id, data) {
        const existing = await this.categoryRepo.findById(tenantId, id);
        if (!existing) {
            const err = new Error('Category not found');
            err.statusCode = 404;
            throw err;
        }
        return await this.categoryRepo.update(tenantId, id, data.name, data.description, data.status);
    }
    async deleteCategory(tenantId, id) {
        const existing = await this.categoryRepo.findById(tenantId, id);
        if (!existing) {
            const err = new Error('Category not found');
            err.statusCode = 404;
            throw err;
        }
        return await this.categoryRepo.delete(tenantId, id);
    }
}
exports.CategoryService = CategoryService;
