"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const database_1 = require("../config/database");
class ProductRepository {
    static async create(tenantId, data) {
        const query = `
      INSERT INTO products (
        tenant_id, category_id, supplier_id, name, sku, barcode, brand,
        purchase_price, selling_price, profit_margin, tax_rate, unit,
        quantity, min_stock, max_stock, image_url, description, active_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
        const values = [
            tenantId,
            data.category_id || null,
            data.supplier_id || null,
            data.name,
            data.sku,
            data.barcode || null,
            data.brand || null,
            data.purchase_price,
            data.selling_price,
            data.profit_margin || 0,
            data.tax_rate || 0,
            data.unit || 'pcs',
            data.quantity || 0,
            data.min_stock || 5,
            data.max_stock || 100,
            data.image_url || null,
            data.description || null,
            data.active_status !== undefined ? data.active_status : true,
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
    static async findPaginated(tenantId, search, categoryId, limit = 50, offset = 0) {
        let baseCondition = 'WHERE tenant_id = $1 AND (archived_at IS NULL)';
        const params = [tenantId];
        let paramIndex = 2;
        if (search) {
            baseCondition += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR barcode ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (categoryId) {
            baseCondition += ` AND category_id = $${paramIndex}`;
            params.push(categoryId);
            paramIndex++;
        }
        const countQuery = `SELECT COUNT(*) FROM products ${baseCondition}`;
        const countResult = await database_1.pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      SELECT * FROM products
      ${baseCondition}
      ORDER BY name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        params.push(limit, offset);
        const dataResult = await database_1.pool.query(dataQuery, params);
        return { products: dataResult.rows, total };
    }
    static async findById(tenantId, id) {
        const query = `
      SELECT * FROM products
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
    `;
        const result = await database_1.pool.query(query, [tenantId, id]);
        return result.rows[0] || null;
    }
    static async update(tenantId, id, data) {
        const query = `
      UPDATE products
      SET category_id = COALESCE($3, category_id),
          supplier_id = COALESCE($4, supplier_id),
          name = COALESCE($5, name),
          sku = COALESCE($6, sku),
          barcode = COALESCE($7, barcode),
          brand = COALESCE($8, brand),
          purchase_price = COALESCE($9, purchase_price),
          selling_price = COALESCE($10, selling_price),
          profit_margin = COALESCE($11, profit_margin),
          tax_rate = COALESCE($12, tax_rate),
          unit = COALESCE($13, unit),
          quantity = COALESCE($14, quantity),
          min_stock = COALESCE($15, min_stock),
          max_stock = COALESCE($16, max_stock),
          image_url = COALESCE($17, image_url),
          description = COALESCE($18, description),
          active_status = COALESCE($19, active_status),
          updated_at = NOW()
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
      RETURNING *
    `;
        const values = [
            tenantId,
            id,
            data.category_id,
            data.supplier_id,
            data.name,
            data.sku,
            data.barcode,
            data.brand,
            data.purchase_price,
            data.selling_price,
            data.profit_margin,
            data.tax_rate,
            data.unit,
            data.quantity,
            data.min_stock,
            data.max_stock,
            data.image_url,
            data.description,
            data.active_status,
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0] || null;
    }
    static async archive(tenantId, id) {
        const query = `
      UPDATE products
      SET archived_at = NOW(), active_status = FALSE
      WHERE tenant_id = $1 AND id = $2 AND (archived_at IS NULL)
      RETURNING id
    `;
        const result = await database_1.pool.query(query, [tenantId, id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async duplicate(tenantId, id) {
        const original = await this.findById(tenantId, id);
        if (!original)
            return null;
        const newSku = `${original.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
        const newName = `${original.name} (Copy)`;
        const query = `
      INSERT INTO products (
        tenant_id, category_id, supplier_id, name, sku, barcode, brand,
        purchase_price, selling_price, profit_margin, tax_rate, unit,
        quantity, min_stock, max_stock, image_url, description, active_status
      ) VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8, $9, $10, $11, 0, $12, $13, $14, $15, $16)
      RETURNING *
    `;
        const values = [
            tenantId,
            original.category_id,
            original.supplier_id,
            newName,
            newSku,
            original.brand,
            original.purchase_price,
            original.selling_price,
            original.profit_margin,
            original.tax_rate,
            original.unit,
            original.min_stock,
            original.max_stock,
            original.image_url,
            original.description,
            original.active_status,
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
}
exports.ProductRepository = ProductRepository;
