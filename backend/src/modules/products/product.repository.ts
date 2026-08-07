import { query } from '../../config/database';

export class ProductRepository {
  async findAll(tenantId: string, search?: string, categoryId?: string, limit: number = 50, offset: number = 0) {
    let queryText = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.tenant_id = $1`;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (search) {
      queryText += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      queryText += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const res = await query(queryText, params);
    return res.rows;
  }

  async findById(tenantId: string, id: string) {
    const res = await query(
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.tenant_id = $1 AND p.id = $2`,
      [tenantId, id]
    );
    return res.rows[0] || null;
  }

  async create(tenantId: string, data: any) {
    const res = await query(
      `INSERT INTO products (
        tenant_id, category_id, name, sku, barcode, brand, supplier_id,
        purchase_price, selling_price, wholesale_price, discount_price,
        tax_rate, profit_margin, unit, quantity, min_stock, max_stock,
        image_url, description, active_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        tenantId,
        data.categoryId || null,
        data.name,
        data.sku,
        data.barcode,
        data.brand || null,
        data.supplierId || null,
        data.purchasePrice,
        data.sellingPrice,
        data.wholesalePrice || null,
        data.discountPrice || null,
        data.taxRate || 0,
        data.profitMargin,
        data.unit || 'pcs',
        data.quantity || 0,
        data.minStock || 0,
        data.maxStock || null,
        data.imageUrl || null,
        data.description || null,
        data.activeStatus ?? true,
      ]
    );
    return res.rows[0];
  }

  async update(tenantId: string, id: string, data: any) {
    const res = await query(
      `UPDATE products SET
        category_id = COALESCE($3, category_id),
        name = COALESCE($4, name),
        sku = COALESCE($5, sku),
        barcode = COALESCE($6, barcode),
        brand = COALESCE($7, brand),
        supplier_id = COALESCE($8, supplier_id),
        purchase_price = COALESCE($9, purchase_price),
        selling_price = COALESCE($10, selling_price),
        wholesale_price = COALESCE($11, wholesale_price),
        discount_price = COALESCE($12, discount_price),
        tax_rate = COALESCE($13, tax_rate),
        profit_margin = COALESCE($14, profit_margin),
        unit = COALESCE($15, unit),
        quantity = COALESCE($16, quantity),
        min_stock = COALESCE($17, min_stock),
        max_stock = COALESCE($18, max_stock),
        image_url = COALESCE($19, image_url),
        description = COALESCE($20, description),
        active_status = COALESCE($21, active_status)
      WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      [
        tenantId,
        id,
        data.categoryId,
        data.name,
        data.sku,
        data.barcode,
        data.brand,
        data.supplierId,
        data.purchasePrice,
        data.sellingPrice,
        data.wholesalePrice,
        data.discountPrice,
        data.taxRate,
        data.profitMargin,
        data.unit,
        data.quantity,
        data.minStock,
        data.maxStock,
        data.imageUrl,
        data.description,
        data.activeStatus,
      ]
    );
    return res.rows[0] || null;
  }

  async delete(tenantId: string, id: string) {
    const res = await query(
      `DELETE FROM products WHERE tenant_id = $1 AND id = $2 RETURNING id`,
      [tenantId, id]
    );
    return res.rows[0] || null;
  }

  async getPricingConfig(tenantId: string) {
    const res = await query(
      `SELECT * FROM pricing_configurations WHERE tenant_id = $1`,
      [tenantId]
    );
    return res.rows[0] || null;
  }

  async upsertPricingConfig(tenantId: string, globalMargin: number, categoryMarginsJson: any) {
    const res = await query(
      `INSERT INTO pricing_configurations (tenant_id, global_margin, category_margins_json, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id) 
       DO UPDATE SET global_margin = $2, category_margins_json = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [tenantId, globalMargin, categoryMarginsJson]
    );
    return res.rows[0];
  }
}