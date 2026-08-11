import { PurchaseOrderRepository } from './po.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { transactionManager } from '../../config/database';

export class PurchaseOrderService {
  private poRepository = new PurchaseOrderRepository();
  private inventoryRepository = new InventoryRepository();

  async createPurchaseOrder(retailerId: number, data: {
    supplierId: number;
    expectedDelivery?: string;
    items: Array<{ productId: number; quantity: number; unitCost: number }>;
  }) {
    if (!data.supplierId || !data.items || data.items.length === 0) {
      throw new Error('Supplier ID and items are required for purchase order');
    }

    return await transactionManager.runInTransaction(async (client) => {
      return await this.poRepository.createPurchaseOrder(
        retailerId,
        data.supplierId,
        data.expectedDelivery || '',
        data.items,
        client
      );
    });
  }

  async updatePOStatus(retailerId: number, poId: number, newStatus: string) {
    const validStatuses = ['Draft', 'Submitted', 'Approved', 'Received', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid purchase order status');
    }

    return await transactionManager.runInTransaction(async (client) => {
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
          await this.inventoryRepository.updateStockAndLog(
            retailerId,
            item.product_id,
            item.quantity,
            'PURCHASE_RECEIPT',
            `PO-${poId}`,
            client
          );
        }
      }

      return updated;
    });
  }

  async getPurchaseOrders(retailerId: number) {
    return await this.poRepository.getPurchaseOrders(retailerId);
  }

  async getPurchaseOrderById(retailerId: number, poId: number) {
    const po = await this.poRepository.findById(retailerId, poId);
    if (!po) {
      throw new Error('Purchase order not found');
    }
    return po;
  }
}