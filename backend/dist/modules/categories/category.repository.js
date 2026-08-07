"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const database_1 = __importDefault(require("../../config/database"));
class CategoryRepository {
    async findAll(tenantId, includeArchived = false) {
        return await database_1.default.category.findMany({
            where: {
                tenant_id: tenantId,
                ...(includeArchived ? {} : { is_archived: false }),
            },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id, tenantId) {
        return await database_1.default.category.findFirst({
            where: { id, tenant_id: tenantId },
            include: { products: true },
        });
    }
    async findByName(name, tenantId) {
        return await database_1.default.category.findFirst({
            where: { tenant_id: tenantId, name: { equals: name, mode: 'insensitive' } },
        });
    }
    async create(data) {
        return await database_1.default.category.create({
            data: {
                tenant_id: data.tenantId,
                name: data.name,
                description: data.description,
            },
        });
    }
    async update(id, tenantId, data) {
        return await database_1.default.category.updateMany({
            where: { id, tenant_id: tenantId },
            data,
        });
    }
    async delete(id, tenantId) {
        return await database_1.default.category.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    }
}
exports.CategoryRepository = CategoryRepository;
