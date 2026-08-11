import { pool } from '../../config/database';

export class AnalyticsRepository {
  async getSalesHistory(retailerId: number, queryParams: { startDate?: string; endDate?: string; status?: string; limit?: string; offset?: string }) {
    let query = `
      SELECT s.id, s.invoice_number, s.customer_name, s.total_amount, s.tax_amount, s.discount_amount, s.total_profit, s.payment_method, s.status, s.created_at,
             u.name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.cashier_id = u.id
      WHERE s.retailer_id = $1
    `;
    const params: any[] = [retailerId];
    let paramIndex = 2;

    if (queryParams.startDate) {
      query += ` AND s.created_at >= $${paramIndex++}`;
      params.push(queryParams.startDate);
    }

    if (queryParams.endDate) {
      query += ` AND s.created_at <= $${paramIndex++}`;
      params.push(queryParams.endDate);
    }

    if (queryParams.status) {
      query += ` AND s.status = $${paramIndex++}`;
      params.push(queryParams.status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;
    const offset = queryParams.offset ? parseInt(queryParams.offset, 10) : 0;

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getSaleById(retailerId: number, saleId: number) {
    const saleQuery = `
      SELECT s.*, u.name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.cashier_id = u.id
      WHERE s.id = $1 AND s.retailer_id = $2
    `;
    const saleRes = await pool.query(saleQuery, [saleId, retailerId]);
    if (saleRes.rows.length === 0) return null;
    const sale = saleRes.rows[0];

    const itemsQuery = `
      SELECT si.*, p.name as product_name, p.sku, p.barcode
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
    `;
    const itemsRes = await pool.query(itemsQuery, [saleId]);
    sale.items = itemsRes.rows;

    return sale;
  }

  async updateSaleStatus(retailerId: number, saleId: number, status: string, client?: any) {
    const db = client || pool;
    const query = `
      UPDATE sales
      SET status = $1
      WHERE id = $2 AND retailer_id = $3
      RETURNING *
    `;
    const res = await db.query(query, [status, saleId, retailerId]);
    return res.rows[0];
  }

  async getAnalyticsSummary(retailerId: number, timeframe: string) {
    // Timeframe can be day, week, month, year
    let interval = '30 days';
    if (timeframe === 'day') interval = '1 day';
    if (timeframe === 'week') interval = '7 days';
    if (timeframe === 'year') interval = '365 days';

    const revenueQuery = `
      SELECT 
        COUNT(id) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(total_profit), 0) as total_profit,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM sales
      WHERE retailer_id = $1 AND status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '${interval}'
    `;
    const revenueRes = await pool.query(revenueQuery, [retailerId]);

    const topProductsQuery = `
      SELECT p.id, p.name, SUM(si.quantity) as total_sold, SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.retailer_id = $1 AND s.status = 'COMPLETED' AND s.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `;
    const topProductsRes = await pool.query(topProductsQuery, [retailerId]);

    const paymentDistQuery = `
      SELECT payment_method, COUNT(id) as count, SUM(total_amount) as total
      FROM sales
      WHERE retailer_id = $1 AND status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY payment_method
    `;
    const paymentDistRes = await pool.query(paymentDistQuery, [retailerId]);

    return {
      summary: revenueRes.rows[0],
      topProducts: topProductsRes.rows,
      paymentDistribution: paymentDistRes.rows
    };
  }

  async getSalesHistoryForPrediction(retailerId: number) {
    const query = `
      SELECT p.id as product_id, p.name, si.quantity, s.created_at
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.retailer_id = $1 AND s.status = 'COMPLETED' AND s.created_at >= NOW() - INTERVAL '90 days'
      ORDER BY s.created_at ASC
    `;
    const res = await pool.query(query, [retailerId]);
    return res.rows;
  }
}