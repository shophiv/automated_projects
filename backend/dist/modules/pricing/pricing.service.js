"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const database_1 = require("../../config/database");
class PricingService {
    calculateSellingPrice(purchasePrice, margin, taxRate = 0) {
        const basePrice = purchasePrice * (1 + margin / 100);
        const finalPrice = basePrice * (1 + taxRate / 100);
        return Math.round(finalPrice * 100) / 100;
    }
    async resolveProductMargin(tenantId, categoryId, productMargin) {
        if (productMargin !== undefined && productMargin !== null) {
            return productMargin;
        }
        if (categoryId) {
            const category = await database_1.db.category.findUnique({
                where: { id: categoryId },
            });
            if (category && category.profit_margin !== null && category.profit_margin !== undefined) {
                return category.profit_margin;
            }
        }
        const tenant = await database_1.db.tenant.findUnique({
            where: { id: tenantId },
        });
        return tenant?.global_margin ?? 20.0;
    }
}
exports.PricingService = PricingService;
