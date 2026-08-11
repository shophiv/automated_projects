import { pool } from '../../config/database';

export class PurchaseOrderRepository {
  async createPurchaseOrder(
    retailerId: number,
    supplierId: number,
    expectedDelivery: string,
    items: Array<{ productId: number; quantity: number; unitCost: number }>,
    client?: any
  ) {
    const db = client || pool;

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

  async findById(retailerId: number, poId: number) {
    const poQuery = `
      SELECT po.id, po.retailer_id, po.supplier_id, s.business_name as supplier_name, po.status, po.total_cost, po.expected_delivery, po.created_at
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1 AND po.retailer_id = $2
    `;
    const poRes = await pool.query(poQuery, [poId, retailerId]);
    if (poRes.rows.length === 0) return null;
    const po = poRes.rows[0];

    const itemsQuery = `
      SELECT poi.id, poi.product_id, p.name as product_name, p.sku, poi.quantity, poi.unit_cost
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = $1
    `;
    const itemsRes = await pool.query(itemsQuery, [poId]);

    return { ...po, items: itemsRes.rows };
  }

  async updateStatus(retailerId: number, poId: number, status: string, client?: any) {
    const db = client || pool;
    const query = `
      UPDATE purchase_orders
      SET status = $1
      WHERE id = $2 AND retailer_id = $3
      RETURNING id, retailer_id, supplier_id, status, total_cost, expected_delivery, created_at
    `;
    const res = await db.query(query, [status, poId, retailerId]);
    return res.rows[0];
  }

  async getPurchaseOrders(retailerId: number) {
    const query = `
      SELECT po.id, po.supplier_id, s.business_name as supplier_name, po.status, po.total_cost, po.expected_delivery, po.created_at
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.retailer_id = $1
      ORDER BY po.created_at DESC
    `;
    const result = await pool.query(query, [retailerId]);
    return result.rows;
  }
}