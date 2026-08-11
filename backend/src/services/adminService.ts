import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key';

export class AdminService {
  static async loginAdmin(email: string, pass: string): Promise<{ token: string; admin: any }> {
    const result = await pool.query('SELECT * FROM platform_admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new Error('Invalid admin credentials');
    }
    const admin = result.rows[0];
    const match = await bcrypt.compare(pass, admin.password_hash);
    if (!match) {
      throw new Error('Invalid admin credentials');
    }

    const payload = {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'platform_admin' as const,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    return { token, admin: { id: admin.id, email: admin.email, name: admin.name } };
  }

  static async listRetailers(search?: string, status?: string): Promise<any[]> {
    let query = `
      SELECT t.id, t.business_name, t.owner_name, t.email, t.phone, t.status, t.storage_used, t.created_at,
             s.name as subscription_name,
             (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) as user_count,
             (SELECT COUNT(*) FROM products p WHERE p.tenant_id = t.id) as product_count,
             (SELECT COUNT(*) FROM sales_transactions st WHERE st.tenant_id = t.id) as sales_count,
             COALESCE((SELECT SUM(st.total_amount) FROM sales_transactions st WHERE st.tenant_id = t.id), 0) as total_revenue
      FROM tenants t
      LEFT JOIN subscriptions s ON t.subscription_id = s.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(t.business_name ILIKE $${params.length} OR t.email ILIKE $${params.length} OR t.owner_name ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY t.created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async updateRetailerStatus(tenantId: string, status: string): Promise<any> {
    const result = await pool.query(
      `UPDATE tenants SET status = $1 WHERE id = $2 RETURNING id, business_name, status`,
      [status, tenantId]
    );
    if (result.rows.length === 0) {
      throw new Error('Retailer tenant not found');
    }
    return result.rows[0];
  }

  static async getPlatformAnalytics(): Promise<any> {
    const tenantsCountRes = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END) as active FROM tenants');
    const revenueRes = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_transactions FROM sales_transactions');
    const signupsRes = await pool.query('SELECT COUNT(*) as recent FROM tenants WHERE created_at >= NOW() - INTERVAL \'30 days\'');
    const subscriptionsRes = await pool.query('SELECT s.name, COUNT(t.id) as count FROM subscriptions s LEFT JOIN tenants t ON t.subscription_id = s.id GROUP BY s.id, s.name');

    return {
      total_retailers: parseInt(tenantsCountRes.rows[0].total, 10),
      active_retailers: parseInt(tenantsCountRes.rows[0].active, 10),
      inactive_retailers: parseInt(tenantsCountRes.rows[0].total, 10) - parseInt(tenantsCountRes.rows[0].active, 10),
      monthly_revenue: parseFloat(revenueRes.rows[0].total_revenue),
      total_transactions: parseInt(revenueRes.rows[0].total_transactions, 10),
      recent_signups_30d: parseInt(signupsRes.rows[0].recent, 10),
      subscriptions_breakdown: subscriptionsRes.rows,
      system_health: {
        database_status: 'healthy',
        redis_status: 'healthy',
        uptime: process.uptime(),
      },
    };
  }

  static async getSupportLogs(): Promise<{ errors: any[]; activities: any[] }> {
    const errorsRes = await pool.query('SELECT * FROM system_error_logs ORDER BY created_at DESC LIMIT 100');
    const activitiesRes = await pool.query('SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 100');
    return {
      errors: errorsRes.rows,
      activities: activitiesRes.rows,
    };
  }

  static async listSubscriptions(): Promise<any[]> {
    const res = await pool.query('SELECT * FROM subscriptions ORDER BY price ASC');
    return res.rows;
  }

  static async assignSubscription(tenantId: string, subscriptionId: string): Promise<any> {
    const res = await pool.query(
      `UPDATE tenants SET subscription_id = $1 WHERE id = $2 RETURNING id, business_name, subscription_id`,
      [subscriptionId, tenantId]
    );
    if (res.rows.length === 0) {
      throw new Error('Tenant not found');
    }
    return res.rows[0];
  }
}