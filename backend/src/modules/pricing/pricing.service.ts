import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

export class PricingService {
  public calculateSellingPrice(purchasePrice: number, margin: number, taxRate: number = 0): number {
    const basePrice = purchasePrice * (1 + margin / 100);
    const finalPrice = basePrice * (1 + taxRate / 100);
    return Math.round(finalPrice * 100) / 100;
  }

  public async resolveProductMargin(tenantId: string, categoryId?: string | null, productMargin?: number | null): Promise<number> {
    if (productMargin !== undefined && productMargin !== null) {
      return productMargin;
    }

    if (categoryId) {
      const category = await db.category.findUnique({
        where: { id: categoryId },
      });
      if (category && category.profit_margin !== null && category.profit_margin !== undefined) {
        return category.profit_margin;
      }
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    return tenant?.global_margin ?? 20.0;
  }
}