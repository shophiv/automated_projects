import prisma from '../../config/database';

export class ProductRepository {
  async findAll(tenantId: string, filters?: { category_id?: string; search?: string; is_archived?: boolean }) {
    return await prisma.product.findMany({
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

  async findById(id: string, tenantId: string) {
    return await prisma.product.findFirst({
      where: { id, tenant_id: tenantId },
      include: { category: true },
    });
  }

  async findBySkuOrBarcode(tenantId: string, sku: string, barcode: string) {
    return await prisma.product.findFirst({
      where: {
        tenant_id: tenantId,
        OR: [{ sku }, { barcode }],
      },
    });
  }

  async create(data: {
    tenant_id: string;
    category_id: string;
    supplier_id?: string;
    name: string;
    sku: string;
    barcode: string;
    brand?: string;
    purchase_price: number;
    selling_price: number;
    wholesale_price?: number;
    discount_price?: number;
    tax_rate?: number;
    unit?: string;
    quantity?: number;
    min_stock?: number;
    max_stock?: number;
    image_url?: string;
    description?: string;
  }) {
    return await prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    return await prisma.product.updateMany({
      where: { id, tenant_id: tenantId },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    return await prisma.product.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  }
}