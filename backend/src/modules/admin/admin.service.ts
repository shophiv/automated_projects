import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { TenantStatus, Prisma } from '@prisma/client';

export class AdminService {
  async getRetailers(search?: string, status?: TenantStatus) {
    const where: any = {};
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

    const tenants = await db.tenant.findMany({
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

  async getRetailerById(id: string) {
    const tenant = await db.tenant.findUnique({
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
      throw new AppError('Retailer tenant not found', 404);
    }

    return tenant;
  }

  async approveRetailer(id: string) {
    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new AppError('Retailer tenant not found', 404);
    }

    await db.tenant.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    await db.auditLog.create({
      data: {
        tenant_id: id,
        action: 'APPROVE_TENANT',
        details: `Tenant ${tenant.business_name} approved by admin.`,
      },
    });
  }

  async updateRetailerStatus(id: string, status: TenantStatus) {
    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new AppError('Retailer tenant not found', 404);
    }

    await db.tenant.update({
      where: { id },
      data: { status },
    });

    await db.auditLog.create({
      data: {
        tenant_id: id,
        action: 'UPDATE_TENANT_STATUS',
        details: `Tenant ${tenant.business_name} status updated to ${status}.`,
      },
    });
  }

  async deleteRetailer(id: string) {
    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new AppError('Retailer tenant not found', 404);
    }

    await db.$transaction(async (prisma: Prisma.TransactionClient) => {
      await prisma.user.deleteMany({ where: { tenant_id: id } });
      await prisma.auditLog.deleteMany({ where: { tenant_id: id } });
      await prisma.tenant.delete({ where: { id } });
    });
  }
}