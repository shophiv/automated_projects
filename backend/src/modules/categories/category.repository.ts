import { query } from '../../config/database';

export class CategoryRepository {
  async findAll(tenantId: string) {
    const res = await query(
      `SELECT * FROM categories WHERE tenant_id = $1 ORDER BY name ASC`,
      [tenantId]
    );
    return res.rows;
  }

  async findById(tenantId: string, id: string) {
    const res = await query(
      `SELECT * FROM categories WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id]
    );
    return res.rows[0] || null;
  }

  async create(tenantId: string, name: string, description?: string, status: string = 'active') {
    const res = await query(
      `INSERT INTO categories (tenant_id, name, description, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tenantId, name, description || null, status]
    );
    return res.rows[0];
  }

  async update(tenantId: string, id: string, name: string, description?: string, status?: string) {
    const res = await query(
      `UPDATE categories 
       SET name = COALESCE($3, name),
           description = COALESCE($4, description),
           status = COALESCE($5, status)
       WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [tenantId, id, name, description, status]
    );
    return res.rows[0] || null;
  }

  async delete(tenantId: string, id: string) {
    const res = await query(
      `DELETE FROM categories WHERE tenant_id = $1 AND id = $2 RETURNING id`,
      [tenantId, id]
    );
    return res.rows[0] || null;
  }
}