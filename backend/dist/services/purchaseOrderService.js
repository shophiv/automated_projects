"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const database_1 = require("../config/database");
const purchaseOrderRepository_1 = require("../repositories/purchaseOrderRepository");
const inventoryService_1 = require("./inventoryService");
class PurchaseOrderService {
    static async createPurchaseOrder(tenantId, data) {
        const cleanData = {
            tenant_id: tenantId,
            supplier_id: data.supplier_id,
            expected_delivery_date: data.expected_delivery_date ?? null,
            items: data.items,
        };
        return await purchaseOrderRepository_1.PurchaseOrderRepository.create(cleanData);
    }
    static async getPurchaseOrders(tenantId) {
        return await purchaseOrderRepository_1.PurchaseOrderRepository.findByTenant(tenantId);
    }
    static async updateStatus(tenantId, userId, id, newStatus) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            const po = await purchaseOrderRepository_1.PurchaseOrderRepository.findById(tenantId, id, client);
            if (!po)
                throw new Error('Purchase order not found');
            const oldStatus = po.status;
            await purchaseOrderRepository_1.PurchaseOrderRepository.updateStatus(tenantId, id, newStatus, client);
            // If transitioning to 'received' or 'completed' from non-received status, restock items
            if ((newStatus === 'received' || newStatus === 'completed') && oldStatus !== 'received' && oldStatus !== 'completed') {
                for (const item of po.items) {
                    await inventoryService_1.InventoryService.adjustStock(tenantId, userId, item.product_id, 'stock_in', item.quantity, `PO Restock: ${po.id}`);
                }
            }
            await client.query('COMMIT');
            return await purchaseOrderRepository_1.PurchaseOrderRepository.findById(tenantId, id);
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
exports.PurchaseOrderService = PurchaseOrderService;
