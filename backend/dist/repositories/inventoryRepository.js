"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const database_1 = require("../config/database");
class InventoryRepository {
    static async createLog(client, data) {
        const query = `
      INSERT INTO inventory_logs (
        tenant_id, product_id, user_id, type, quantity_change, previous_quantity, new_quantity, reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [
            data.tenantId,
            data.productId,
            data.userId || null,
            data.type,
            data.quantityChange,
            data.previousQuantity,
            data.newQuantity,
            data.reference || null,
        ];
        const res = await client.query(query, values);
        return res.rows[0];
    }
    static async getHistory(tenantId, limit = 50, offset = 0) {
        const countRes = await database_1.pool.query('SELECT COUNT(*) FROM inventory_logs WHERE tenant_id = $1', [tenantId]);
        const total = parseInt(countRes.rows[0].count, 10);
        const dataRes = await database_1.pool.query(`SELECT il.*, p.name as product_name, p.sku as product_sku 
       FROM inventory_logs il
       JOIN products p ON il.product_id = p.id
       WHERE il.tenant_id = $1
       ORDER BY il.created_at DESC
       LIMIT $2 OFFSET $3`, [tenantId, limit, offset]);
        return { logs: dataRes.rows, total };
    }
    static async getAlerts(tenantId) {
        const lowStockRes = await database_1.pool.query(`SELECT * FROM products 
       WHERE tenant_id = $1 AND archived_at IS NULL AND quantity > 0 AND quantity <= min_stock
       ORDER BY quantity ASC`, [tenantId]);
        const outOfStockRes = await database_1.pool.query(`SELECT * FROM products 
       WHERE tenant_id = $1 AND archived_at IS NULL AND quantity = 0
       ORDER BY name ASC`, [tenantId]);
        return {
            lowStock: lowStockRes.rows,
            outOfStock: outOfStockRes.rows,
        };
    }
}
exports.InventoryRepository = InventoryRepository;
