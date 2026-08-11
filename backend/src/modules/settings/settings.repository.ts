import { pool } from '../../config/database';

export class SettingsRepository {
  async getSettings(retailerId: number) {
    const query = `SELECT setting_key, setting_value FROM retailer_settings WHERE retailer_id = $1`;
    const res = await pool.query(query, [retailerId]);
    const settings: { [key: string]: any } = {};
    for (const row of res.rows) {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    }
    return settings;
  }

  async updateSettings(retailerId: number, settings: { [key: string]: any }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(settings)) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const upsertQuery = `
          INSERT INTO retailer_settings (retailer_id, setting_key, setting_value)
          VALUES ($1, $2, $3)
          ON CONFLICT (retailer_id, setting_key)
          DO UPDATE SET setting_value = EXCLUDED.setting_value
        `;
        await client.query(upsertQuery, [retailerId, key, valStr]);
      }
      await client.query('COMMIT');
      return await this.getSettings(retailerId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}