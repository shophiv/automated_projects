import { pool } from '../config/database';

export class SettingsService {
  static async getSettings(tenantId: string): Promise<any> {
    const query = `
      SELECT id, business_name, owner_name, email, phone, address, status, storage_used, settings_json, created_at
      FROM tenants
      WHERE id = $1
    `;
    const result = await pool.query(query, [tenantId]);
    if (result.rows.length === 0) {
      throw new Error('Tenant profile not found');
    }
    return result.rows[0];
  }

  static async updateSettings(tenantId: string, data: { business_name?: string; owner_name?: string; phone?: string; address?: string; settings_json?: any }): Promise<any> {
    const current = await this.getSettings(tenantId);
    const updatedSettings = {
      ...(current.settings_json || {}),
      ...(data.settings_json || {}),
    };

    const query = `
      UPDATE tenants
      SET business_name = COALESCE($1, business_name),
          owner_name = COALESCE($2, owner_name),
          phone = COALESCE($3, phone),
          address = COALESCE($4, address),
          settings_json = $5
      WHERE id = $6
      RETURNING id, business_name, owner_name, email, phone, address, status, storage_used, settings_json, created_at
    `;
    const result = await pool.query(query, [
      data.business_name || null,
      data.owner_name || null,
      data.phone || null,
      data.address || null,
      updatedSettings,
      tenantId,
    ]);
    return result.rows[0];
  }
}