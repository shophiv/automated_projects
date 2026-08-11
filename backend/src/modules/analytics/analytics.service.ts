import { AnalyticsRepository } from './analytics.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { transactionManager } from '../../config/database';

export class AnalyticsService {
  private analyticsRepo = new AnalyticsRepository();
  private inventoryRepo = new InventoryRepository();

  async getSalesHistory(retailerId: number, queryParams: any) {
    return await this.analyticsRepo.getSalesHistory(retailerId, queryParams);
  }

  async getSaleById(retailerId: number, saleId: number) {
    const sale = await this.analyticsRepo.getSaleById(retailerId, saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    return sale;
  }

  async processRefund(retailerId: number, saleId: number) {
    return await transactionManager.runInTransaction(async (client) => {
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
        await this.inventoryRepo.updateStockAndLog(
          retailerId,
          item.product_id,
          item.quantity,
          'REFUND',
          `REFUND-SALE-${saleId}`,
          client
        );
      }

      return { message: 'Refund processed successfully', sale: updatedSale };
    });
  }

  async reprintInvoice(retailerId: number, saleId: number) {
    const sale = await this.analyticsRepo.getSaleById(retailerId, saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    return {
      message: 'Invoice ready for reprint',
      sale
    };
  }

  async getSalesAnalytics(retailerId: number, timeframe: string) {
    return await this.analyticsRepo.getAnalyticsSummary(retailerId, timeframe || 'month');
  }
}