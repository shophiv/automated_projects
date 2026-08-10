import { pool } from '../config/database';
import { SalesRepository } from '../repositories/salesRepository';
import { InventoryRepository } from '../repositories/inventoryRepository';
import { AccountingRepository } from '../repositories/accountingRepository';
import { PredictionService } from './predictionService';

export class DashboardService {
  static async getDashboardMetrics(tenantId: string) {
    const today = new Date().toISOString().split('T')[0];

    const todaySalesQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(SUM(profit_amount), 0) as total_profit,
        COUNT(*) as total_orders
      FROM sales_transactions
      WHERE tenant_id = $1 AND status = 'completed' AND DATE(sale_date) = $2;
    `;
    const { rows: salesRows } = await pool.query(todaySalesQuery, [tenantId, today]);
    const todaySales = parseFloat(salesRows[0].total_sales);
    const todayProfit = parseFloat(salesRows[0].total_profit);
    const todayOrders = parseInt(salesRows[0].total_orders, 10);

    const inventoryValQuery = `
      SELECT COALESCE(SUM(quantity * selling_price), 0) as inventory_value
      FROM products
      WHERE tenant_id = $1 AND (archived_at IS NULL);
    `;
    const { rows: invRows } = await pool.query(inventoryValQuery, [tenantId]);
    const inventoryValue = parseFloat(invRows[0].inventory_value);

    const alerts = await InventoryRepository.getAlerts(tenantId);

    const topProductsQuery = `
      SELECT p.id, p.name, p.sku, SUM(si.quantity) as units_sold
      FROM sale_items si
      JOIN sales_transactions st ON si.sale_id = st.id
      JOIN products p ON si.product_id = p.id
      WHERE st.tenant_id = $1 AND st.status = 'completed'
      GROUP BY p.id, p.name, p.sku
      ORDER BY units_sold DESC
      LIMIT 5;
    `;
    const { rows: topProducts } = await pool.query(topProductsQuery, [tenantId]);

    const recentSalesResult = await SalesRepository.findSales(tenantId, {}, 5, 0);
    const recentSales = recentSalesResult.sales;

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const financialSummary = await AccountingRepository.getFinancialSummary(tenantId, firstDayOfMonth);

    const predictions = await PredictionService.generateForecasts(tenantId);

    return {
      today: {
        sales: todaySales,
        profit: todayProfit,
        orders: todayOrders,
      },
      inventory_value: inventoryValue,
      low_stock_count: alerts.lowStock.length,
      out_of_stock_count: alerts.outOfStock.length,
      alerts,
      top_selling_products: topProducts,
      recent_transactions: recentSales,
      monthly_financials: financialSummary,
      predictions,
    };
  }
}