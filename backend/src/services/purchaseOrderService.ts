import { pool } from '../config/database';
import { PurchaseOrderRepository, PurchaseOrderData } from '../repositories/purchaseOrderRepository';
import { InventoryService } from './inventoryService';
import { PoolClient } from 'pg';

export class PurchaseOrderService {
  static async createPurchaseOrder(tenantId: string, data: Omit<PurchaseOrderData, 'tenant_id'>): Promise<any> {
    const cleanData: PurchaseOrderData = {
      tenant_id: tenantId,
      supplier_id: data.supplier_id,
      expected_delivery_date: data.expected_delivery_date ?? null,
      items: data.items,
    };
    return await PurchaseOrderRepository.create(cleanData);
  }

  static async getPurchaseOrders(tenantId: string): Promise<any[]> {
    return await PurchaseOrderRepository.findByTenant(tenantId);
  }

  static async updateStatus(tenantId: string, userId: string, id: string, newStatus: string): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const po = await PurchaseOrderRepository.findById(tenantId, id, client);
      if (!po) throw new Error('Purchase order not found');

      const oldStatus = po.status;
      await PurchaseOrderRepository.updateStatus(tenantId, id, newStatus, client);

      // If transitioning to 'received' or 'completed' from non-received status, restock items
      if ((newStatus === 'received' || newStatus === 'completed') && oldStatus !== 'received' && oldStatus !== 'completed') {
        for (const item of po.items) {
          await InventoryService.adjustStock(
            tenantId,
            userId,
            item.product_id,
            'stock_in',
            item.quantity,
            `PO Restock: ${po.id}`
          );
        }
      }

      await client.query('COMMIT');
      return await PurchaseOrderRepository.findById(tenantId, id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}