import { pool } from '../../config/database';

export class NotificationRepository {
  async createNotification(retailerId: number, userId: number | null, title: string, message: string, type: string) {
    const query = `
      INSERT INTO notifications (retailer_id, user_id, title, message, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await pool.query(query, [retailerId, userId, title, message, type]);
    return res.rows[0];
  }

  async getNotifications(retailerId: number, unreadOnly: boolean = false) {
    let query = `SELECT * FROM notifications WHERE retailer_id = $1`;
    const params: any[] = [retailerId];

    if (unreadOnly) {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;
    const res = await pool.query(query, params);
    return res.rows;
  }

  async markAsRead(retailerId: number, notificationId: number) {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND retailer_id = $2
      RETURNING *
    `;
    const res = await pool.query(query, [notificationId, retailerId]);
    return res.rows[0];
  }
}