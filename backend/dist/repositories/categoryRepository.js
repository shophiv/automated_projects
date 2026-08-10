"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const database_1 = require("../config/database");
class CategoryRepository {
    static async create(tenantId, data) {
        const query = `
      INSERT INTO categories (tenant_id, name, description, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING *
    `;
        const result = await database_1.pool.query(query, [tenantId, data.name, data.description || null]);
        return result.rows[0];
    }
    static async findAll(tenantId) {
        const query = `
      SELECT * FROM categories
      WHERE tenant_id = $1 AND (archived_at IS NULL)
      ORDER BY name ASC
    `;
        const result = await database_1.pool.query(query, [tenantId]);
        return result.rows;
    }
    static async findById(tenantId, id) {
        const query = `
      SELECT * FROM categories
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
    `;
        const result = await database_1.pool.query(query, [tenantId, id]);
        return result.rows[0] || null;
    }
    static async update(tenantId, id, data) {
        const query = `
      UPDATE categories
      SET name = COALESCE($3, name),
          description = COALESCE($4, description),
          status = COALESCE($5, status)
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
      RETURNING *
    `;
        const result = await database_1.pool.query(query, [tenantId, id, data.name, data.description, data.status]);
        return result.rows[0] || null;
    }
    static async archive(tenantId, id) {
        const query = `
      UPDATE categories
      SET archived_at = NOW(), status = 'archived'
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
      RETURNING id
    `;
        const result = await database_1.pool.query(query, [tenantId, id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.CategoryRepository = CategoryRepository;
