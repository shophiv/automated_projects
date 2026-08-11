"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const database_1 = require("../../config/database");
class InventoryRepository {
    async updateStockAndLog(retailerId, productId, quantityChange, type, referenceId, client) {
        const db = client || database_1.pool;
        // Get current product quantity
        const productQuery = `
      SELECT id, quantity, purchase_price, selling_price, name
      FROM products
      WHERE id = $1 AND retailer_id = $2
      FOR UPDATE
    `;
        const productRes = await db.query(productQuery, [productId, retailerId]);
        if (productRes.rows.length === 0) {
            throw new Error('Product not found');
        }
        const product = productRes.rows[0];
        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity + quantityChange;
        if (newQuantity < 0) {
            throw new Error(`Insufficient stock for product ${product.name}. Current stock: ${previousQuantity}`);
        }
        // Update product quantity
        const updateQuery = `
      UPDATE products
      SET quantity = $1
      WHERE id = $2 AND retailer_id = $3
    `;
        await db.query(updateQuery, [newQuantity, productId, retailerId]);
        // Insert inventory log
        const logQuery = `
      INSERT INTO inventory_logs (retailer_id, product_id, type, quantity_change, previous_quantity, new_quantity, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, retailer_id, product_id, type, quantity_change, previous_quantity, new_quantity, reference_id, created_at
    `;
        const logRes = await db.query(logQuery, [
            retailerId,
            productId,
            type,
            quantityChange,
            previousQuantity,
            newQuantity,
            referenceId || null
        ]);
        return logRes.rows[0];
    }
    async getHistory(retailerId, queryParams) {
        let query = `
      SELECT l.id, l.product_id, p.name as product_name, p.sku, l.type, l.quantity_change, l.previous_quantity, l.new_quantity, l.reference_id, l.created_at
      FROM inventory_logs l
      JOIN products p ON l.product_id = p.id
      WHERE l.retailer_id = $1
    `;
        const params = [retailerId];
        let paramIndex = 2;
        if (queryParams.productId) {
            query += ` AND l.product_id = $${paramIndex++}`;
            params.push(parseInt(queryParams.productId, 10));
        }
        if (queryParams.type) {
            query += ` AND l.type = $${paramIndex++}`;
            params.push(queryParams.type);
        }
        query += ` ORDER BY l.created_at DESC`;
        const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;
        const offset = queryParams.offset ? parseInt(queryParams.offset, 10) : 0;
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        const result = await database_1.pool.query(query, params);
        return result.rows;
    }
    async getValuation(retailerId) {
        const query = `
      SELECT 
        COUNT(id) as total_products,
        SUM(quantity) as total_units,
        SUM(quantity * purchase_price) as total_purchase_valuation,
        SUM(quantity * selling_price) as total_retail_valuation
      FROM products
      WHERE retailer_id = $1 AND status = 'active'
    `;
        const result = await database_1.pool.query(query, [retailerId]);
        return result.rows[0];
    }
    async getAlerts(retailerId) {
        const query = `
      SELECT id, name, sku, barcode, quantity, min_stock, max_stock
      FROM products
      WHERE retailer_id = $1 AND status = 'active' AND quantity <= min_stock
      ORDER BY quantity ASC
    `;
        const result = await database_1.pool.query(query, [retailerId]);
        return result.rows;
    }
}
exports.InventoryRepository = InventoryRepository;
