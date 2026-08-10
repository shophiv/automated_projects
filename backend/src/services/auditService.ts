import { pool } from '../config/database';
import { logger } from '../utils/logger';

export class AuditService {
  static async logAction(
    tenantId: string | null,
    userId: string | null,
    action: string,
    details: object
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_logs (tenant_id, user_id, action, details, timestamp)
        VALUES ($1, $2, $3, $4, NOW())
      `;
      await pool.query(query, [tenantId, userId, action, JSON.stringify(details)]);
    } catch (error) {
      logger.error('Failed to write audit log:', error);
    }
  }
}