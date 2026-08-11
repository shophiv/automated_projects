"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const database_1 = require("../../config/database");
class NotificationRepository {
    async createNotification(retailerId, userId, title, message, type) {
        const query = `
      INSERT INTO notifications (retailer_id, user_id, title, message, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const res = await database_1.pool.query(query, [retailerId, userId, title, message, type]);
        return res.rows[0];
    }
    async getNotifications(retailerId, unreadOnly = false) {
        let query = `SELECT * FROM notifications WHERE retailer_id = $1`;
        const params = [retailerId];
        if (unreadOnly) {
            query += ` AND is_read = false`;
        }
        query += ` ORDER BY created_at DESC LIMIT 50`;
        const res = await database_1.pool.query(query, params);
        return res.rows;
    }
    async markAsRead(retailerId, notificationId) {
        const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND retailer_id = $2
      RETURNING *
    `;
        const res = await database_1.pool.query(query, [notificationId, retailerId]);
        return res.rows[0];
    }
}
exports.NotificationRepository = NotificationRepository;
