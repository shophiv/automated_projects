import { InventoryRepository } from './inventory.repository';
import { transactionManager } from '../../config/database';

export class InventoryService {
  private inventoryRepository = new InventoryRepository();

  async recordStockIn(retailerId: number, data: { productId: number; quantity: number; referenceId?: string }) {
    if (!data.productId || data.quantity <= 0) {
      throw new Error('Valid product ID and positive quantity required for stock in');
    }
    return await transactionManager.runInTransaction(async (client) => {
      return await this.inventoryRepository.updateStockAndLog(
        retailerId,
        data.productId,
        data.quantity,
        'STOCK_IN',
        data.referenceId,
        client
      );
    });
  }

  async recordStockOut(retailerId: number, data: { productId: number; quantity: number; referenceId?: string }) {
    if (!data.productId || data.quantity <= 0) {
      throw new Error('Valid product ID and positive quantity required for stock out');
    }
    return await transactionManager.runInTransaction(async (client) => {
      return await this.inventoryRepository.updateStockAndLog(
        retailerId,
        data.productId,
        -Math.abs(data.quantity),
        'STOCK_OUT',
        data.referenceId,
        client
      );
    });
  }

  async adjustStock(retailerId: number, data: { productId: number; newQuantity: number; referenceId?: string }) {
    if (!data.productId || data.newQuantity < 0) {
      throw new Error('Valid product ID and non-negative quantity required for adjustment');
    }

    return await transactionManager.runInTransaction(async (client) => {
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

      return await this.inventoryRepository.updateStockAndLog(
        retailerId,
        data.productId,
        change,
        'ADJUSTMENT',
        data.referenceId,
        client
      );
    });
  }

  async transferStock(retailerId: number, data: { productId: number; quantity: number; sourceLocation?: string; targetLocation?: string; referenceId?: string }) {
    if (!data.productId || data.quantity <= 0) {
      throw new Error('Valid product ID and positive quantity required for transfer');
    }

    const ref = data.referenceId || `TRANSFER-${data.sourceLocation || 'Main'}->${data.targetLocation || 'Branch'}`;

    return await transactionManager.runInTransaction(async (client) => {
      return await this.inventoryRepository.updateStockAndLog(
        retailerId,
        data.productId,
        -Math.abs(data.quantity),
        'TRANSFER_OUT',
        ref,
        client
      );
    });
  }

  async getStockHistory(retailerId: number, queryParams: any) {
    return await this.inventoryRepository.getHistory(retailerId, queryParams);
  }

  async getInventoryValuation(retailerId: number) {
    return await this.inventoryRepository.getValuation(retailerId);
  }

  async checkStockAlerts(retailerId: number) {
    return await this.inventoryRepository.getAlerts(retailerId);
  }
}