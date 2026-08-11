import { pool } from '../../config/database';

export class CategoryRepository {
  async create(retailerId: number, data: { name: string; description?: string; status?: string }) {
    const query = `
      INSERT INTO categories (retailer_id, name, description, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, retailer_id, name, description, status, created_at
    `;
    const result = await pool.query(query, [
      retailerId,
      data.name,
      data.description || null,
      data.status || 'active'
    ]);
    return result.rows[0];
  }

  async findById(categoryId: number, retailerId: number) {
    const query = `
      SELECT id, retailer_id, name, description, status, created_at
      FROM categories
      WHERE id = $1 AND retailer_id = $2
    `;
    const result = await pool.query(query, [categoryId, retailerId]);
    return result.rows[0];
  }

  async findAll(retailerId: number) {
    const query = `
      SELECT id, retailer_id, name, description, status, created_at
      FROM categories
      WHERE retailer_id = $1
      ORDER BY name ASC
    `;
    const result = await pool.query(query, [retailerId]);
    return result.rows;
  }

  async update(categoryId: number, retailerId: number, data: { name?: string; description?: string; status?: string }) {
    const query = `
      UPDATE categories
      SET name = COALESCE($3, name),
          description = COALESCE($4, description),
          status = COALESCE($5, status)
      WHERE id = $1 AND retailer_id = $2
      RETURNING id, retailer_id, name, description, status, created_at
    `;
    const result = await pool.query(query, [
      categoryId,
      retailerId,
      data.name,
      data.description,
      data.status
    ]);
    return result.rows[0];
  }

  async delete(categoryId: number, retailerId: number) {
    const query = `
      DELETE FROM categories
      WHERE id = $1 AND retailer_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [categoryId, retailerId]);
    return result.rows[0];
  }
}