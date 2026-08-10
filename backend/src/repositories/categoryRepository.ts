import { pool } from '../config/database';

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: string;
  archived_at?: Date | null;
  created_at: Date;
}

export class CategoryRepository {
  static async create(tenantId: string, data: { name: string; description?: string }): Promise<Category> {
    const query = `
      INSERT INTO categories (tenant_id, name, description, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING *
    `;
    const result = await pool.query(query, [tenantId, data.name, data.description || null]);
    return result.rows[0];
  }

  static async findAll(tenantId: string): Promise<Category[]> {
    const query = `
      SELECT * FROM categories
      WHERE tenant_id = $1 AND (archived_at IS NULL)
      ORDER BY name ASC
    `;
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  static async findById(tenantId: string, id: string): Promise<Category | null> {
    const query = `
      SELECT * FROM categories
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
    `;
    const result = await pool.query(query, [tenantId, id]);
    return result.rows[0] || null;
  }

  static async update(tenantId: string, id: string, data: { name?: string; description?: string; status?: string }): Promise<Category | null> {
    const query = `
      UPDATE categories
      SET name = COALESCE($3, name),
          description = COALESCE($4, description),
          status = COALESCE($5, status)
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
      RETURNING *
    `;
    const result = await pool.query(query, [tenantId, id, data.name, data.description, data.status]);
    return result.rows[0] || null;
  }

  static async archive(tenantId: string, id: string): Promise<boolean> {
    const query = `
      UPDATE categories
      SET archived_at = NOW(), status = 'archived'
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
      RETURNING id
    `;
    const result = await pool.query(query, [tenantId, id]);
    return (result.rowCount ?? 0) > 0;
  }
}