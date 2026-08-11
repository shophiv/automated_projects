"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderRepository = void 0;
const database_1 = require("../../config/database");
class PurchaseOrderRepository {
    async createPurchaseOrder(retailerId, supplierId, expectedDelivery, items, client) {
        const db = client || database_1.pool;
        let totalCost = 0;
        items.forEach(item => {
            totalCost += item.quantity * item.unitCost;
        });
        const poQuery = `
      INSERT INTO purchase_orders (retailer_id, supplier_id, status, total_cost, expected_delivery)
      VALUES ($1, $2, 'Draft', $3, $4)
      RETURNING id, retailer_id, supplier_id, status, total_cost, expected_delivery, created_at
    `;
        const poRes = await db.query(poQuery, [retailerId, supplierId, totalCost, expectedDelivery || null]);
        const po = poRes.rows[0];
        const createdItems = [];
        for (const item of items) {
            const itemQuery = `
        INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost)
        VALUES ($1, $2, $3, $4)
        RETURNING id, purchase_order_id, product_id, quantity, unit_cost
      `;
            const itemRes = await db.query(itemQuery, [po.id, item.productId, item.quantity, item.unitCost]);
            createdItems.push(itemRes.rows[0]);
        }
        return { ...po, items: createdItems };
    }
    async findById(retailerId, poId) {
        const poQuery = `
      SELECT po.id, po.retailer_id, po.supplier_id, s.business_name as supplier_name, po.status, po.total_cost, po.expected_delivery, po.created_at
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1 AND po.retailer_id = $2
    `;
        const poRes = await database_1.pool.query(poQuery, [poId, retailerId]);
        if (poRes.rows.length === 0)
            return null;
        const po = poRes.rows[0];
        const itemsQuery = `
      SELECT poi.id, poi.product_id, p.name as product_name, p.sku, poi.quantity, poi.unit_cost
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = $1
    `;
        const itemsRes = await database_1.pool.query(itemsQuery, [poId]);
        return { ...po, items: itemsRes.rows };
    }
    async updateStatus(retailerId, poId, status, client) {
        const db = client || database_1.pool;
        const query = `
      UPDATE purchase_orders
      SET status = $1
      WHERE id = $2 AND retailer_id = $3
      RETURNING id, retailer_id, supplier_id, status, total_cost, expected_delivery, created_at
    `;
        const res = await db.query(query, [status, poId, retailerId]);
        return res.rows[0];
    }
    async getPurchaseOrders(retailerId) {
        const query = `
      SELECT po.id, po.supplier_id, s.business_name as supplier_name, po.status, po.total_cost, po.expected_delivery, po.created_at
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.retailer_id = $1
      ORDER BY po.created_at DESC
    `;
        const result = await database_1.pool.query(query, [retailerId]);
        return result.rows;
    }
}
exports.PurchaseOrderRepository = PurchaseOrderRepository;
