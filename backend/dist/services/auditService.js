"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class AuditService {
    static async logAction(tenantId, userId, action, details) {
        try {
            const query = `
        INSERT INTO audit_logs (tenant_id, user_id, action, details, timestamp)
        VALUES ($1, $2, $3, $4, NOW())
      `;
            await database_1.pool.query(query, [tenantId, userId, action, JSON.stringify(details)]);
        }
        catch (error) {
            logger_1.logger.error('Failed to write audit log:', error);
        }
    }
}
exports.AuditService = AuditService;
