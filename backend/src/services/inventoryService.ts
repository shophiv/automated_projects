import { pool } from '../config/database';
import { InventoryRepository } from '../repositories/inventoryRepository';

export class InventoryService {
  static async adjustStock(
    tenantId: string,
    userId: string,
    productId: string,
    type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer',
    quantityChange: number,
    reference?: string
  ): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const prodRes = await client.query(
        'SELECT id, quantity FROM products WHERE tenant_id = $1 AND id = $2 AND archived_at IS NULL FOR UPDATE',
        [tenantId, productId]
      );

      if (prodRes.rows.length === 0) {
        throw new Error('Product not found');
      }

      const product = prodRes.rows[0];
      const previousQuantity = product.quantity;
      let newQuantity = previousQuantity;

      if (type === 'stock_in') {
        newQuantity = previousQuantity + Math.abs(quantityChange);
      } else if (type === 'stock_out') {
        newQuantity = Math.max(0, previousQuantity - Math.abs(quantityChange));
      } else if (type === 'adjustment') {
        newQuantity = quantityChange; // absolute set or signed diff based on design
      } else if (type === 'transfer') {
        newQuantity = Math.max(0, previousQuantity + quantityChange);
      }

      const netChange = newQuantity - previousQuantity;

      await client.query(
        'UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQuantity, productId]
      );

      const log = await InventoryRepository.createLog(client, {
        tenantId,
        productId,
        userId,
        type,
        quantityChange: netChange,
        previousQuantity,
        newQuantity,
        reference,
      });

      await client.query('COMMIT');
      return { product: { id: productId, quantity: newQuantity }, log };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async deductStock(
    client: any,
    tenantId: string,
    saleItems: Array<{ product_id: string; quantity: number }>,
    userId?: string
  ): Promise<void> {
    for (const item of saleItems) {
      const prodRes = await client.query(
        'SELECT quantity FROM products WHERE tenant_id = $1 AND id = $2 FOR UPDATE',
        [tenantId, item.product_id]
      );
      if (prodRes.rows.length === 0) {
        throw new Error(`Product not found for inventory deduction: ${item.product_id}`);
      }

      const previousQuantity = prodRes.rows[0].quantity;
      const newQuantity = Math.max(0, previousQuantity - item.quantity);

      await client.query(
        'UPDATE products SET quantity = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3',
        [newQuantity, tenantId, item.product_id]
      );

      await InventoryRepository.createLog(client, {
        tenantId,
        productId: item.product_id,
        userId: userId || undefined,
        type: 'sale',
        quantityChange: -item.quantity,
        previousQuantity,
        newQuantity,
        reference: 'POS Checkout',
      });
    }
  }

  static async getHistory(tenantId: string, limit = 50, offset = 0) {
    return InventoryRepository.getHistory(tenantId, limit, offset);
  }

  static async getAlerts(tenantId: string) {
    return InventoryRepository.getAlerts(tenantId);
  }
}