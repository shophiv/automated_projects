"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
class PricingService {
    calculateSellingPrice(purchasePrice, margin, taxRate = 0) {
        const cost = Number(purchasePrice) || 0;
        const mag = Number(margin) || 0;
        const tax = Number(taxRate) || 0;
        const basePrice = cost * (1 + mag / 100);
        const finalPrice = basePrice * (1 + tax / 100);
        return Number(finalPrice.toFixed(2));
    }
}
exports.PricingService = PricingService;
