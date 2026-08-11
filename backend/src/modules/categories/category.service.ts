import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

export class CategoryService {
  async getCategories(tenantId: string) {
    return db.category.findMany({
      where: { tenant_id: tenantId, archived: false },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(tenantId: string, dto: { name: string; description?: string; profit_margin?: number }) {
    const existing = await db.category.findFirst({
      where: { tenant_id: tenantId, name: dto.name },
    });

    if (existing) {
      throw new AppError('Category with this name already exists', 400);
    }

    return db.category.create({
      data: {
        tenant_id: tenantId,
        name: dto.name,
        description: dto.description,
        profit_margin: dto.profit_margin,
      },
    });
  }

  async updateCategory(tenantId: string, id: string, dto: { name?: string; description?: string; profit_margin?: number }) {
    const category = await db.category.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return db.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.profit_margin !== undefined && { profit_margin: dto.profit_margin }),
      },
    });
  }

  async archiveCategory(tenantId: string, id: string) {
    const category = await db.category.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return db.category.update({
      where: { id },
      data: { archived: true },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    const category = await db.category.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await db.category.delete({
      where: { id },
    });
  }
}