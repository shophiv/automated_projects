"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../shared/errors/AppError");
class CategoryService {
    async getCategories(tenantId) {
        return database_1.db.category.findMany({
            where: { tenant_id: tenantId, archived: false },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(tenantId, dto) {
        const existing = await database_1.db.category.findFirst({
            where: { tenant_id: tenantId, name: dto.name },
        });
        if (existing) {
            throw new AppError_1.AppError('Category with this name already exists', 400);
        }
        return database_1.db.category.create({
            data: {
                tenant_id: tenantId,
                name: dto.name,
                description: dto.description,
                profit_margin: dto.profit_margin,
            },
        });
    }
    async updateCategory(tenantId, id, dto) {
        const category = await database_1.db.category.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!category) {
            throw new AppError_1.AppError('Category not found', 404);
        }
        return database_1.db.category.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.profit_margin !== undefined && { profit_margin: dto.profit_margin }),
            },
        });
    }
    async archiveCategory(tenantId, id) {
        const category = await database_1.db.category.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!category) {
            throw new AppError_1.AppError('Category not found', 404);
        }
        return database_1.db.category.update({
            where: { id },
            data: { archived: true },
        });
    }
    async deleteCategory(tenantId, id) {
        const category = await database_1.db.category.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!category) {
            throw new AppError_1.AppError('Category not found', 404);
        }
        await database_1.db.category.delete({
            where: { id },
        });
    }
}
exports.CategoryService = CategoryService;
