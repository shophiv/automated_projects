import { pool } from '../config/database';

export class AnalyticsService {
  static async getSalesAnalytics(tenantId: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily') {
    let dateFormat = 'YYYY-MM-DD';
    if (interval === 'weekly') dateFormat = 'YYYY-IW';
    if (interval === 'monthly') dateFormat = 'YYYY-MM';

    const query = `
      SELECT 
        TO_CHAR(sale_date, $2) as period,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(profit_amount), 0) as profit,
        COUNT(*) as transaction_count
      FROM sales_transactions
      WHERE tenant_id = $1 AND status = 'completed'
      GROUP BY period
      ORDER BY period ASC
      LIMIT 30;
    `;
    const { rows } = await pool.query(query, [tenantId, dateFormat]);

    // Payment distribution
    const paymentQuery = `
      SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
      FROM sales_transactions
      WHERE tenant_id = $1 AND status = 'completed'
      GROUP BY payment_method;
    `;
    const { rows: paymentRows } = await pool.query(paymentQuery, [tenantId]);

    // Category performance
    const categoryQuery = `
      SELECT c.name as category_name, SUM(si.total_price) as total_sales
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN sales_transactions st ON si.sale_id = st.id
      WHERE st.tenant_id = $1 AND st.status = 'completed'
      GROUP BY c.name
      ORDER BY total_sales DESC;
    `;
    const { rows: categoryRows } = await pool.query(categoryQuery, [tenantId]);

    return {
      sales_trend: rows,
      payment_distribution: paymentRows,
      category_performance: categoryRows,
    };
  }
}