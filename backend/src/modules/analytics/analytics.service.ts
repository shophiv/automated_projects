import { AnalyticsRepository } from './analytics.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { transactionManager } from '../../config/database';

export class AnalyticsService {
  private analyticsRepo = new AnalyticsRepository();
  private inventoryRepo = new InventoryRepository();

  async getSalesHistory(retailerId: number, queryParams: any) {
    return await this.analyticsRepo.getSalesHistory(retailerId, queryParams);
  }

  async exportSalesStatistics(retailerId: number, queryParams: any, format: string) {
    const sales = await this.analyticsRepo.getSalesForExport(retailerId, queryParams);
    const summary = await this.analyticsRepo.getAnalyticsSummary(retailerId, queryParams.timeframe || 'month');

    if (format === 'csv') {
      let csv = 'Invoice Number,Customer,Total Amount,Tax,Discount,Profit,Payment Method,Status,Cashier,Date\n';
      for (const s of sales) {
        csv += `"${s.invoice_number}","${s.customer_name || 'Walk-in'}","${s.total_amount}","${s.tax_amount}","${s.discount_amount}","${s.total_profit}","${s.payment_method}","${s.status}","${s.cashier_name || ''}","${s.created_at}"\n`;
      }
      return { contentType: 'text/csv', filename: `sales_statistics_${Date.now()}.csv`, data: csv };
    }

    // Default to JSON export
    return {
      format: 'json',
      generatedAt: new Date().toISOString(),
      summary,
      salesCount: sales.length,
      sales
    };
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

      const updatedSale = await this.analyticsRepo.updateSaleStatus(retailerId, saleId, 'REFUNDED', client);

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