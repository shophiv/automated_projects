"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const database_1 = require("../../config/database");
class InventoryService {
    async getInventory(tenantId) {
        const result = await (0, database_1.query)(`SELECT i.id, i.tenant_id, i.product_id, i.quantity, i.low_stock_threshold, i.updated_at,
              p.sku, p.name, p.price, p.cost, p.status, p.barcode
       FROM inventory i
       JOIN products p ON i.product_id = p.id AND i.tenant_id = p.tenant_id
       WHERE i.tenant_id = $1
       ORDER BY p.name ASC`, [tenantId]);
        return result.rows;
    }
    async updateInventory(tenantId, productId, dto) {
        // Verify product exists and belongs to tenant
        const productCheck = await (0, database_1.query)('SELECT id FROM products WHERE tenant_id = $1 AND id = $2', [tenantId, productId]);
        if (productCheck.rows.length === 0) {
            throw new Error('Product not found in workspace.');
        }
        const result = await (0, database_1.query)(`INSERT INTO inventory (tenant_id, product_id, quantity, low_stock_threshold, updated_at)
       VALUES ($1, $2, COALESCE($3, 0), COALESCE($4, 5), CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, product_id) 
       DO UPDATE SET 
         quantity = COALESCE($3, inventory.quantity),
         low_stock_threshold = COALESCE($4, inventory.low_stock_threshold),
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, tenant_id, product_id, quantity, low_stock_threshold, updated_at`, [tenantId, productId, dto.quantity !== undefined ? dto.quantity : null, dto.lowStockThreshold !== undefined ? dto.lowStockThreshold : null]);
        return result.rows[0];
    }
}
exports.InventoryService = InventoryService;
