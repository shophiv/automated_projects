"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const database_1 = __importDefault(require("../../config/database"));
class ProductRepository {
    async findAll(tenantId, filters) {
        return await database_1.default.product.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters?.category_id ? { category_id: filters.category_id } : {}),
                ...(filters?.is_archived !== undefined ? { is_archived: filters.is_archived } : { is_archived: false }),
                ...(filters?.search
                    ? {
                        OR: [
                            { name: { contains: filters.search, mode: 'insensitive' } },
                            { sku: { contains: filters.search, mode: 'insensitive' } },
                            { barcode: { contains: filters.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: { category: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async findById(id, tenantId) {
        return await database_1.default.product.findFirst({
            where: { id, tenant_id: tenantId },
            include: { category: true },
        });
    }
    async findBySkuOrBarcode(tenantId, sku, barcode) {
        return await database_1.default.product.findFirst({
            where: {
                tenant_id: tenantId,
                OR: [{ sku }, { barcode }],
            },
        });
    }
    async create(data) {
        return await database_1.default.product.create({
            data,
            include: { category: true },
        });
    }
    async update(id, tenantId, data) {
        return await database_1.default.product.updateMany({
            where: { id, tenant_id: tenantId },
            data,
        });
    }
    async delete(id, tenantId) {
        return await database_1.default.product.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    }
}
exports.ProductRepository = ProductRepository;
