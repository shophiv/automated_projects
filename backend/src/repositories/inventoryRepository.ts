import { pool } from '../config/database';

export interface InventoryLog {
  id: string;
  tenant_id: string;
  product_id: string;
  user_id?: string | null;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'sale';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference?: string | null;
  created_at: Date;
}

export class InventoryRepository {
  static async createLog(
    client: any,
    data: {
      tenantId: string;
      productId: string;
      userId?: string;
      type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'sale';
      quantityChange: number;
      previousQuantity: number;
      newQuantity: number;
      reference?: string;
    }
  ): Promise<InventoryLog> {
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

  static async getHistory(
    tenantId: string,
    limit = 50,
    offset = 0
  ): Promise<{ logs: InventoryLog[]; total: number }> {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM inventory_logs WHERE tenant_id = $1',
      [tenantId]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await pool.query(
      `SELECT il.*, p.name as product_name, p.sku as product_sku 
       FROM inventory_logs il
       JOIN products p ON il.product_id = p.id
       WHERE il.tenant_id = $1
       ORDER BY il.created_at DESC
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );

    return { logs: dataRes.rows, total };
  }

  static async getAlerts(tenantId: string): Promise<{ lowStock: any[]; outOfStock: any[] }> {
    const lowStockRes = await pool.query(
      `SELECT * FROM products 
       WHERE tenant_id = $1 AND archived_at IS NULL AND quantity > 0 AND quantity <= min_stock
       ORDER BY quantity ASC`,
      [tenantId]
    );

    const outOfStockRes = await pool.query(
      `SELECT * FROM products 
       WHERE tenant_id = $1 AND archived_at IS NULL AND quantity = 0
       ORDER BY name ASC`,
      [tenantId]
    );

    return {
      lowStock: lowStockRes.rows,
      outOfStock: outOfStockRes.rows,
    };
  }
}