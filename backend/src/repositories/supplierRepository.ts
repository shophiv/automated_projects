import { pool } from '../config/database';
import { PoolClient } from 'pg';

export interface SupplierData {
  tenant_id: string;
  business_name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export class SupplierRepository {
  static async create(data: SupplierData, client?: PoolClient): Promise<any> {
    const db = client || pool;
    const query = `
      INSERT INTO suppliers (tenant_id, business_name, contact_person, phone, email, address, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING *;
    `;
    const values = [
      data.tenant_id,
      data.business_name,
      data.contact_person || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.notes || null,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByTenant(tenantId: string): Promise<any[]> {
    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id) as total_purchase_orders,
        (SELECT COALESCE(SUM(po.total_cost), 0) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.status = 'completed') as total_purchased_amount
      FROM suppliers s
      WHERE s.tenant_id = $1
      ORDER BY s.business_name ASC;
    `;
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  static async findById(tenantId: string, id: string): Promise<any> {
    const query = `SELECT * FROM suppliers WHERE tenant_id = $1 AND id = $2;`;
    const result = await pool.query(query, [tenantId, id]);
    return result.rows[0] || null;
  }

  static async update(tenantId: string, id: string, data: Partial<SupplierData>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (key !== 'tenant_id' && key !== 'id') {
        fields.push(`${key} = $${idx++}`);
        values.push(val !== undefined ? val : null);
      }
    }

    if (fields.length === 0) return await this.findById(tenantId, id);

    values.push(tenantId, id);
    const query = `
      UPDATE suppliers
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE tenant_id = $${idx++} AND id = $${idx}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(tenantId: string, id: string): Promise<boolean> {
    const query = `DELETE FROM suppliers WHERE tenant_id = $1 AND id = $2 RETURNING id;`;
    const result = await pool.query(query, [tenantId, id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getSupplierReport(tenantId: string, supplierId: string): Promise<any> {
    const supplier = await this.findById(tenantId, supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const poQuery = `
      SELECT po.*, 
        (SELECT json_agg(json_build_object(
          'id', poi.id,
          'product_id', poi.product_id,
          'quantity', poi.quantity,
          'unit_cost', poi.unit_cost,
          'received_quantity', poi.received_quantity
        )) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items
      FROM purchase_orders po
      WHERE po.tenant_id = $1 AND po.supplier_id = $2
      ORDER BY po.created_at DESC;
    `;
    const poResult = await pool.query(poQuery, [tenantId, supplierId]);

    const productsQuery = `
      SELECT DISTINCT p.id, p.name, p.sku, p.selling_price, poi.unit_cost, poi.quantity
      FROM purchase_order_items poi
      JOIN purchase_orders po ON poi.purchase_order_id = po.id
      JOIN products p ON poi.product_id = p.id
      WHERE po.tenant_id = $1 AND po.supplier_id = $2;
    `;
    const productsResult = await pool.query(productsQuery, [tenantId, supplierId]);

    return {
      supplier,
      purchase_orders: poResult.rows,
      supplied_products: productsResult.rows,
    };
  }
}