"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../shared/errors/AppError");
class AdminService {
    async getRetailers(search, status) {
        const where = {};
        if (search) {
            where.OR = [
                { business_name: { contains: search, mode: 'insensitive' } },
                { owner_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const tenants = await database_1.db.tenant.findMany({
            where,
            include: {
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return tenants;
    }
    async getRetailerById(id) {
        const tenant = await database_1.db.tenant.findUnique({
            where: { id },
            include: {
                users: true,
                audit_logs: {
                    take: 50,
                    orderBy: { timestamp: 'desc' },
                },
            },
        });
        if (!tenant) {
            throw new AppError_1.AppError('Retailer tenant not found', 404);
        }
        return tenant;
    }
    async approveRetailer(id) {
        const tenant = await database_1.db.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new AppError_1.AppError('Retailer tenant not found', 404);
        }
        await database_1.db.tenant.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
        await database_1.db.auditLog.create({
            data: {
                tenant_id: id,
                action: 'APPROVE_TENANT',
                details: `Tenant ${tenant.business_name} approved by admin.`,
            },
        });
    }
    async updateRetailerStatus(id, status) {
        const tenant = await database_1.db.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new AppError_1.AppError('Retailer tenant not found', 404);
        }
        await database_1.db.tenant.update({
            where: { id },
            data: { status },
        });
        await database_1.db.auditLog.create({
            data: {
                tenant_id: id,
                action: 'UPDATE_TENANT_STATUS',
                details: `Tenant ${tenant.business_name} status updated to ${status}.`,
            },
        });
    }
    async deleteRetailer(id) {
        const tenant = await database_1.db.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new AppError_1.AppError('Retailer tenant not found', 404);
        }
        await database_1.db.$transaction(async (prisma) => {
            await prisma.user.deleteMany({ where: { tenant_id: id } });
            await prisma.auditLog.deleteMany({ where: { tenant_id: id } });
            await prisma.tenant.delete({ where: { id } });
        });
    }
}
exports.AdminService = AdminService;
