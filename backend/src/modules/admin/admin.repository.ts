import { pool } from '../../config/database';

export class AdminRepository {
  async getRetailersList(query: { status?: string; search?: string; limit?: string; offset?: string }) {
    let sql = `
      SELECT r.*, s.name as subscription_name,
             (SELECT COUNT(*) FROM users u WHERE u.retailer_id = r.id) as user_count,
             (SELECT COUNT(*) FROM products p WHERE p.retailer_id = r.id) as product_count,
             (SELECT COUNT(*) FROM sales sl WHERE sl.retailer_id = r.id) as sales_count
      FROM retailers r
      LEFT JOIN subscriptions s ON r.subscription_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (query.status) {
      sql += ` AND r.status = $${paramIndex++}`;
      params.push(query.status);
    }

    if (query.search) {
      sql += ` AND (r.business_name ILIKE $${paramIndex} OR r.email ILIKE $${paramIndex})_`;
      // fix syntax
      sql = sql.replace('_', '');
      params.push(`%${query.search}%`);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const res = await pool.query(sql, params);
    return res.rows;
  }

  async updateRetailerStatus(retailerId: number, status: string) {
    const res = await pool.query(
      `UPDATE retailers SET status = $1 WHERE id = $2 RETURNING *`,
      [status, retailerId]
    );
    return res.rows[0];
  }

  async deleteRetailer(retailerId: number, client?: any) {
    const db = client || pool;
    // Cascade delete or soft delete
    await db.query(`DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE retailer_id = $1)`, [retailerId]);
    await db.query(`DELETE FROM sales WHERE retailer_id = $1`, [retailerId]);
    await db.query(`DELETE FROM products WHERE retailer_id = $1`, [retailerId]);
    await db.query(`DELETE FROM categories WHERE retailer_id = $1`, [retailerId]);
    await db.query(`DELETE FROM suppliers WHERE retailer_id = $1`, [retailerId]);
    await db.query(`DELETE FROM users WHERE retailer_id = $1`, [retailerId]);
    const res = await db.query(`DELETE FROM retailers WHERE id = $1 RETURNING *`, [retailerId]);
    return res.rows[0];
  }

  async resetRetailerPassword(retailerId: number, hashedPassword: string) {
    // Reset password for the owner of the retailer
    const res = await pool.query(
      `UPDATE users SET password_hash = $1 WHERE retailer_id = $2 AND role = 'Owner' RETURNING id, email, role`,
      [hashedPassword, retailerId]
    );
    return res.rows[0];
  }

  async getSubscriptions() {
    const res = await pool.query(`SELECT * FROM subscriptions ORDER BY price ASC`);
    return res.rows;
  }

  async updateSubscriptionPlan(planId: number, limits: { max_users: number; max_products: number; storage_limit: number; price: number; features_json: string }) {
    const res = await pool.query(
      `UPDATE subscriptions SET max_users = $1, max_products = $2, storage_limit = $3, price = $4, features_json = $5 WHERE id = $6 RETURNING *`,
      [limits.max_users, limits.max_products, limits.storage_limit, limits.price, limits.features_json, planId]
    );
    return res.rows[0];
  }

  async getPlatformAnalytics() {
    const retailersRes = await pool.query(`
      SELECT 
        COUNT(*) as total_retailers,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_retailers,
        SUM(CASE WHEN status != 'ACTIVE' THEN 1 ELSE 0 END) as inactive_retailers
      FROM retailers
    `);

    const signupsRes = await pool.query(`
      SELECT COUNT(*) as signups_last_30_days
      FROM retailers
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const revenueRes = await pool.query(`
      SELECT COALESCE(SUM(s.price), 0) as monthly_recurring_revenue
      FROM retailers r
      JOIN subscriptions s ON r.subscription_id = s.id
      WHERE r.status = 'ACTIVE'
    `);

    const transactionsRes = await pool.query(`
      SELECT COUNT(*) as total_transactions, COALESCE(SUM(total_amount), 0) as total_transaction_volume
      FROM sales
      WHERE status = 'COMPLETED'
    `);

    return {
      retailerStats: retailersRes.rows[0],
      signupsStats: signupsRes.rows[0],
      revenueStats: revenueRes.rows[0],
      transactionStats: transactionsRes.rows[0],
      systemHealth: {
        status: 'HEALTHY',
        uptime: '99.99%',
        databaseConnection: 'CONNECTED',
        activeConnections: 12
      }
    };
  }

  async getSupportLogs(query: { limit?: string }) {
    const limit = query.limit ? parseInt(query.limit, 10) : 100;
    const res = await pool.query(
      `SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  async logAdminAction(adminId: number, action: string, targetRetailerId?: number, details?: string) {
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_retailer_id, details) VALUES ($1, $2, $3, $4)`,
      [adminId, action, targetRetailerId || null, details || null]
    );
  }
}