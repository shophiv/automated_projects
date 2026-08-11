"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class NotificationService {
    static async getNotifications(tenantId, limit = 50, offset = 0) {
        const query = `
      SELECT id, tenant_id, user_id, type, message, read_status, created_at
      FROM notifications
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const result = await database_1.pool.query(query, [tenantId, limit, offset]);
        return result.rows;
    }
    static async createNotification(tenantId, userId, type, message) {
        try {
            const query = `
        INSERT INTO notifications (tenant_id, user_id, type, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, tenant_id, user_id, type, message, read_status, created_at
      `;
            const result = await database_1.pool.query(query, [tenantId, userId, type, message]);
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Failed to create notification:', error);
        }
    }
    static async broadcastToAllTenants(type, message) {
        try {
            const tenantsResult = await database_1.pool.query('SELECT id FROM tenants WHERE status = $1', ['active']);
            for (const tenant of tenantsResult.rows) {
                await this.createNotification(tenant.id, null, type, message);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to broadcast system announcement:', error);
        }
    }
}
exports.NotificationService = NotificationService;
