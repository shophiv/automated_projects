"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const inventory_repository_1 = require("./inventory.repository");
const database_1 = require("../../config/database");
class InventoryService {
    inventoryRepository = new inventory_repository_1.InventoryRepository();
    async recordStockIn(retailerId, data) {
        if (!data.productId || data.quantity <= 0) {
            throw new Error('Valid product ID and positive quantity required for stock in');
        }
        return await database_1.transactionManager.runInTransaction(async (client) => {
            return await this.inventoryRepository.updateStockAndLog(retailerId, data.productId, data.quantity, 'STOCK_IN', data.referenceId, client);
        });
    }
    async recordStockOut(retailerId, data) {
        if (!data.productId || data.quantity <= 0) {
            throw new Error('Valid product ID and positive quantity required for stock out');
        }
        return await database_1.transactionManager.runInTransaction(async (client) => {
            return await this.inventoryRepository.updateStockAndLog(retailerId, data.productId, -Math.abs(data.quantity), 'STOCK_OUT', data.referenceId, client);
        });
    }
    async adjustStock(retailerId, data) {
        if (!data.productId || data.newQuantity < 0) {
            throw new Error('Valid product ID and non-negative quantity required for adjustment');
        }
        return await database_1.transactionManager.runInTransaction(async (client) => {
            // First get current quantity
            const productQuery = `SELECT quantity FROM products WHERE id = $1 AND retailer_id = $2 FOR UPDATE`;
            const res = await client.query(productQuery, [data.productId, retailerId]);
            if (res.rows.length === 0) {
                throw new Error('Product not found');
            }
            const currentQuantity = res.rows[0].quantity;
            const change = data.newQuantity - currentQuantity;
            if (change === 0) {
                throw new Error('New quantity is the same as current quantity');
            }
            return await this.inventoryRepository.updateStockAndLog(retailerId, data.productId, change, 'ADJUSTMENT', data.referenceId, client);
        });
    }
    async transferStock(retailerId, data) {
        if (!data.productId || data.quantity <= 0) {
            throw new Error('Valid product ID and positive quantity required for transfer');
        }
        const ref = data.referenceId || `TRANSFER-${data.sourceLocation || 'Main'}->${data.targetLocation || 'Branch'}`;
        return await database_1.transactionManager.runInTransaction(async (client) => {
            return await this.inventoryRepository.updateStockAndLog(retailerId, data.productId, -Math.abs(data.quantity), 'TRANSFER_OUT', ref, client);
        });
    }
    async getStockHistory(retailerId, queryParams) {
        return await this.inventoryRepository.getHistory(retailerId, queryParams);
    }
    async getInventoryValuation(retailerId) {
        return await this.inventoryRepository.getValuation(retailerId);
    }
    async checkStockAlerts(retailerId) {
        return await this.inventoryRepository.getAlerts(retailerId);
    }
}
exports.InventoryService = InventoryService;
