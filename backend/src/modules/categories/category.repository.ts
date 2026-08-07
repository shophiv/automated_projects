import prisma from '../../config/database';

export class CategoryRepository {
  async findAll(tenantId: string, includeArchived = false) {
    return await prisma.category.findMany({
      where: {
        tenant_id: tenantId,
        ...(includeArchived ? {} : { is_archived: false }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    return await prisma.category.findFirst({
      where: { id, tenant_id: tenantId },
      include: { products: true },
    });
  }

  async findByName(name: string, tenantId: string) {
    return await prisma.category.findFirst({
      where: { tenant_id: tenantId, name: { equals: name, mode: 'insensitive' } },
    });
  }

  async create(data: { tenantId: string; name: string; description?: string }) {
    return await prisma.category.create({
      data: {
        tenant_id: data.tenantId,
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, tenantId: string, data: { name?: string; description?: string; is_archived?: boolean }) {
    return await prisma.category.updateMany({
      where: { id, tenant_id: tenantId },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    return await prisma.category.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  }
}