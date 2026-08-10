import { pool } from '../config/database';
import { PoolClient } from 'pg';

export interface PurchaseOrderItemData {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

export interface PurchaseOrderData {
  tenant_id: string;
  supplier_id: string;
  expected_delivery_date?: string | null;
  items: PurchaseOrderItemData[];
}

export class PurchaseOrderRepository {
  static async create(data: PurchaseOrderData, client?: PoolClient): Promise<any> {
    const db = client || (await pool.connect());
    const shouldRelease = !client;

    try {
      if (shouldRelease) await db.query('BEGIN');

      let totalCost = 0;
      for (const item of data.items) {
        totalCost += item.quantity * item.unit_cost;
      }

      const poQuery = `
        INSERT INTO purchase_orders (tenant_id, supplier_id, status, total_cost, expected_delivery_date)
        VALUES ($1, $2, 'draft', $3, $4)
        RETURNING *;
      `;
      const poValues = [
        data.tenant_id,
        data.supplier_id,
        totalCost,
        data.expected_delivery_date || null,
      ];
      const poResult = await db.query(poQuery, poValues);
      const po = poResult.rows[0];

      for (const item of data.items) {
        const itemQuery = `
          INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost, received_quantity)
          VALUES ($1, $2, $3, $4, 0);
        `;
        await db.query(itemQuery, [po.id, item.product_id, item.quantity, item.unit_cost]);
      }

      if (shouldRelease) await db.query('COMMIT');
      return await this.findById(data.tenant_id, po.id, client);
    } catch (error) {
      if (shouldRelease) await db.query('ROLLBACK');
      throw error;
    } finally {
      if (shouldRelease) (db as PoolClient).release();
    }
  }

  static async findByTenant(tenantId: string): Promise<any[]> {
    const query = `
      SELECT po.*, s.business_name as supplier_name,
        (SELECT json_agg(json_build_object(
          'id', poi.id,
          'product_id', poi.product_id,
          'quantity', poi.quantity,
          'unit_cost', poi.unit_cost,
          'received_quantity', poi.received_quantity
        )) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.tenant_id = $1
      ORDER BY po.created_at DESC;
    `;
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  static async findById(tenantId: string, id: string, client?: PoolClient): Promise<any> {
    const db = client || pool;
    const query = `
      SELECT po.*, s.business_name as supplier_name,
        (SELECT json_agg(json_build_object(
          'id', poi.id,
          'product_id', poi.product_id,
          'quantity', poi.quantity,
          'unit_cost', poi.unit_cost,
          'received_quantity', poi.received_quantity
        )) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.tenant_id = $1 AND po.id = $2;
    `;
    const result = await db.query(query, [tenantId, id]);
    return result.rows[0] || null;
  }

  static async updateStatus(tenantId: string, id: string, status: string, client?: PoolClient): Promise<any> {
    const db = client || pool;
    const query = `
      UPDATE purchase_orders
      SET status = $1, updated_at = NOW()
      WHERE tenant_id = $2 AND id = $3
      RETURNING *;
    `;
    const result = await db.query(query, [status, tenantId, id]);
    return result.rows[0] || null;
  }
}