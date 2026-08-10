"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const connection_1 = require("../../shared/database/connection");
class CategoryRepository {
    async findAllByRetailer(retailerId) {
        const res = await (0, connection_1.query)('SELECT * FROM categories WHERE retailer_id = $1 ORDER BY name ASC', [retailerId]);
        return res.rows;
    }
    async findById(id, retailerId) {
        const res = await (0, connection_1.query)('SELECT * FROM categories WHERE id = $1 AND retailer_id = $2', [id, retailerId]);
        return res.rows[0];
    }
    async create(data) {
        const res = await (0, connection_1.query)(`INSERT INTO categories (retailer_id, name, slug, description)
       VALUES ($1, $2, $3, $4) RETURNING *`, [data.retailerId, data.name, data.slug, data.description || null]);
        return res.rows[0];
    }
    async update(id, retailerId, data) {
        const res = await (0, connection_1.query)(`UPDATE categories 
       SET name = $1, slug = $2, description = $3, archived = COALESCE($4, archived)
       WHERE id = $5 AND retailer_id = $6 RETURNING *`, [data.name, data.slug, data.description || null, data.archived, id, retailerId]);
        return res.rows[0];
    }
    async delete(id, retailerId) {
        const res = await (0, connection_1.query)('DELETE FROM categories WHERE id = $1 AND retailer_id = $2 RETURNING id', [id, retailerId]);
        return res.rows[0];
    }
}
exports.CategoryRepository = CategoryRepository;
