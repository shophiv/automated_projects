import { query } from '../../shared/database/connection';

export class CategoryRepository {
  async findAllByRetailer(retailerId: string) {
    const res = await query(
      'SELECT * FROM categories WHERE retailer_id = $1 ORDER BY name ASC',
      [retailerId]
    );
    return res.rows;
  }

  async findById(id: string, retailerId: string) {
    const res = await query(
      'SELECT * FROM categories WHERE id = $1 AND retailer_id = $2',
      [id, retailerId]
    );
    return res.rows[0];
  }

  async create(data: { retailerId: string; name: string; slug: string; description?: string }) {
    const res = await query(
      `INSERT INTO categories (retailer_id, name, slug, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.retailerId, data.name, data.slug, data.description || null]
    );
    return res.rows[0];
  }

  async update(id: string, retailerId: string, data: { name: string; slug: string; description?: string; archived?: boolean }) {
    const res = await query(
      `UPDATE categories 
       SET name = $1, slug = $2, description = $3, archived = COALESCE($4, archived)
       WHERE id = $5 AND retailer_id = $6 RETURNING *`,
      [data.name, data.slug, data.description || null, data.archived, id, retailerId]
    );
    return res.rows[0];
  }

  async delete(id: string, retailerId: string) {
    const res = await query(
      'DELETE FROM categories WHERE id = $1 AND retailer_id = $2 RETURNING id',
      [id, retailerId]
    );
    return res.rows[0];
  }
}