"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const analytics_repository_1 = require("./analytics.repository");
const inventory_repository_1 = require("../inventory/inventory.repository");
const database_1 = require("../../config/database");
class AnalyticsService {
    analyticsRepo = new analytics_repository_1.AnalyticsRepository();
    inventoryRepo = new inventory_repository_1.InventoryRepository();
    async getSalesHistory(retailerId, queryParams) {
        return await this.analyticsRepo.getSalesHistory(retailerId, queryParams);
    }
    async getSaleById(retailerId, saleId) {
        const sale = await this.analyticsRepo.getSaleById(retailerId, saleId);
        if (!sale) {
            throw new Error('Sale not found');
        }
        return sale;
    }
    async processRefund(retailerId, saleId) {
        return await database_1.transactionManager.runInTransaction(async (client) => {
            const sale = await this.analyticsRepo.getSaleById(retailerId, saleId);
            if (!sale) {
                throw new Error('Sale not found');
            }
            if (sale.status === 'REFUNDED') {
                throw new Error('Sale has already been refunded');
            }
            // Update sale status to REFUNDED
            const updatedSale = await this.analyticsRepo.updateSaleStatus(retailerId, saleId, 'REFUNDED', client);
            // Return items to inventory
            for (const item of sale.items) {
                await this.inventoryRepo.updateStockAndLog(retailerId, item.product_id, item.quantity, 'REFUND', `REFUND-SALE-${saleId}`, client);
            }
            return { message: 'Refund processed successfully', sale: updatedSale };
        });
    }
    async reprintInvoice(retailerId, saleId) {
        const sale = await this.analyticsRepo.getSaleById(retailerId, saleId);
        if (!sale) {
            throw new Error('Sale not found');
        }
        return {
            message: 'Invoice ready for reprint',
            sale
        };
    }
    async getSalesAnalytics(retailerId, timeframe) {
        return await this.analyticsRepo.getAnalyticsSummary(retailerId, timeframe || 'month');
    }
}
exports.AnalyticsService = AnalyticsService;
