"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const po_repository_1 = require("./po.repository");
const inventory_repository_1 = require("../inventory/inventory.repository");
const database_1 = require("../../config/database");
class PurchaseOrderService {
    poRepository = new po_repository_1.PurchaseOrderRepository();
    inventoryRepository = new inventory_repository_1.InventoryRepository();
    async createPurchaseOrder(retailerId, data) {
        if (!data.supplierId || !data.items || data.items.length === 0) {
            throw new Error('Supplier ID and items are required for purchase order');
        }
        return await database_1.transactionManager.runInTransaction(async (client) => {
            return await this.poRepository.createPurchaseOrder(retailerId, data.supplierId, data.expectedDelivery || '', data.items, client);
        });
    }
    async updatePOStatus(retailerId, poId, newStatus) {
        const validStatuses = ['Draft', 'Submitted', 'Approved', 'Received', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid purchase order status');
        }
        return await database_1.transactionManager.runInTransaction(async (client) => {
            const po = await this.poRepository.findById(retailerId, poId);
            if (!po) {
                throw new Error('Purchase order not found');
            }
            if (po.status === 'Completed' || po.status === 'Cancelled') {
                throw new Error(`Cannot update purchase order that is already ${po.status}`);
            }
            const updated = await this.poRepository.updateStatus(retailerId, poId, newStatus, client);
            // If status becomes Received or Completed, automatically trigger stock-in
            if (newStatus === 'Received' && po.status !== 'Received' && po.status !== 'Completed') {
                for (const item of po.items) {
                    await this.inventoryRepository.updateStockAndLog(retailerId, item.product_id, item.quantity, 'PURCHASE_RECEIPT', `PO-${poId}`, client);
                }
            }
            return updated;
        });
    }
    async getPurchaseOrders(retailerId) {
        return await this.poRepository.getPurchaseOrders(retailerId);
    }
    async getPurchaseOrderById(retailerId, poId) {
        const po = await this.poRepository.findById(retailerId, poId);
        if (!po) {
            throw new Error('Purchase order not found');
        }
        return po;
    }
}
exports.PurchaseOrderService = PurchaseOrderService;
