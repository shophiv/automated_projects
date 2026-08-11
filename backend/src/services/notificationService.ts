import { pool } from '../config/database';
import { logger } from '../utils/logger';

export class NotificationService {
  static async getNotifications(tenantId: string, limit = 50, offset = 0): Promise<any[]> {
    const query = `
      SELECT id, tenant_id, user_id, type, message, read_status, created_at
      FROM notifications
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [tenantId, limit, offset]);
    return result.rows;
  }

  static async createNotification(tenantId: string, userId: string | null, type: string, message: string): Promise<any> {
    try {
      const query = `
        INSERT INTO notifications (tenant_id, user_id, type, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, tenant_id, user_id, type, message, read_status, created_at
      `;
      const result = await pool.query(query, [tenantId, userId, type, message]);
      return result.rows[0];
    } catch (error: any) {
      logger.error('Failed to create notification:', error);
    }
  }

  static async broadcastToAllTenants(type: string, message: string): Promise<void> {
    try {
      const tenantsResult = await pool.query('SELECT id FROM tenants WHERE status = $1', ['active']);
      for (const tenant of tenantsResult.rows) {
        await this.createNotification(tenant.id, null, type, message);
      }
    } catch (error: any) {
      logger.error('Failed to broadcast system announcement:', error);
    }
  }
}