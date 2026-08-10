"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const database_1 = require("../config/database");
const salesRepository_1 = require("../repositories/salesRepository");
const inventoryRepository_1 = require("../repositories/inventoryRepository");
class SalesService {
    static async getSales(tenantId, filters, limit = 50, offset = 0) {
        return salesRepository_1.SalesRepository.findSales(tenantId, filters, limit, offset);
    }
    static async getSaleById(tenantId, saleId) {
        const sale = await salesRepository_1.SalesRepository.findById(tenantId, saleId);
        if (!sale) {
            throw new Error('Sale transaction not found');
        }
        return sale;
    }
    static async refundSale(tenantId, userId, saleId) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            const sale = await salesRepository_1.SalesRepository.findById(tenantId, saleId);
            if (!sale) {
                throw new Error('Sale transaction not found');
            }
            if (sale.status === 'refunded') {
                throw new Error('Sale has already been refunded');
            }
            for (const item of sale.items) {
                const prodRes = await client.query('SELECT quantity FROM products WHERE id = $1', [item.product_id]);
                if (prodRes.rows.length > 0) {
                    const previousQuantity = prodRes.rows[0].quantity;
                    const newQuantity = previousQuantity + item.quantity;
                    await client.query('UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2', [
                        newQuantity,
                        item.product_id,
                    ]);
                    await inventoryRepository_1.InventoryRepository.createLog(client, {
                        tenantId,
                        productId: item.product_id,
                        userId,
                        type: 'adjustment',
                        quantityChange: item.quantity,
                        previousQuantity,
                        newQuantity,
                        reference: `REFUND-${sale.invoice_number}`,
                    });
                }
            }
            const updatedSale = await salesRepository_1.SalesRepository.updateStatus(client, tenantId, saleId, 'refunded');
            await client.query('COMMIT');
            return updatedSale;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.SalesService = SalesService;
