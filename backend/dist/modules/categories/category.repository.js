"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const database_1 = require("../../config/database");
class CategoryRepository {
    async findAll(tenantId) {
        const res = await (0, database_1.query)(`SELECT * FROM categories WHERE tenant_id = $1 ORDER BY name ASC`, [tenantId]);
        return res.rows;
    }
    async findById(tenantId, id) {
        const res = await (0, database_1.query)(`SELECT * FROM categories WHERE tenant_id = $1 AND id = $2`, [tenantId, id]);
        return res.rows[0] || null;
    }
    async create(tenantId, name, description, status = 'active') {
        const res = await (0, database_1.query)(`INSERT INTO categories (tenant_id, name, description, status)
       VALUES ($1, $2, $3, $4) RETURNING *`, [tenantId, name, description || null, status]);
        return res.rows[0];
    }
    async update(tenantId, id, name, description, status) {
        const res = await (0, database_1.query)(`UPDATE categories 
       SET name = COALESCE($3, name),
           description = COALESCE($4, description),
           status = COALESCE($5, status)
       WHERE tenant_id = $1 AND id = $2 RETURNING *`, [tenantId, id, name, description, status]);
        return res.rows[0] || null;
    }
    async delete(tenantId, id) {
        const res = await (0, database_1.query)(`DELETE FROM categories WHERE tenant_id = $1 AND id = $2 RETURNING id`, [tenantId, id]);
        return res.rows[0] || null;
    }
}
exports.CategoryRepository = CategoryRepository;
