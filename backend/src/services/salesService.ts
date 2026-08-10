import { pool } from '../config/database';
import { SalesRepository } from '../repositories/salesRepository';
import { InventoryRepository } from '../repositories/inventoryRepository';

export class SalesService {
  static async getSales(
    tenantId: string,
    filters?: { search?: string; status?: string; startDate?: string; endDate?: string },
    limit = 50,
    offset = 0
  ): Promise<{ sales: any[]; total: number }> {
    return SalesRepository.findSales(tenantId, filters, limit, offset);
  }

  static async getSaleById(tenantId: string, saleId: string): Promise<any> {
    const sale = await SalesRepository.findById(tenantId, saleId);
    if (!sale) {
      throw new Error('Sale transaction not found');
    }
    return sale;
  }

  static async refundSale(tenantId: string, userId: string, saleId: string): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const sale = await SalesRepository.findById(tenantId, saleId);
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

          await InventoryRepository.createLog(client, {
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

      const updatedSale = await SalesRepository.updateStatus(client, tenantId, saleId, 'refunded');

      await client.query('COMMIT');
      return updatedSale;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}