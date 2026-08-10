import { query } from '../../shared/database/connection';

export class ProductRepository {
  async findAllByRetailer(retailerId: string, search?: string, categoryId?: string) {
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.retailer_id = $1
    `;
    const params: any[] = [retailerId];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.barcode ILIKE $${params.length})`;
    }

    if (categoryId) {
      params.push(categoryId);
      sql += ` AND p.category_id = $${params.length}`;
    }

    sql += ' ORDER BY p.name ASC';
    const res = await query(sql, params);
    return res.rows;
  }

  async findById(id: string, retailerId: string) {
    const res = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1 AND p.retailer_id = $2`,
      [id, retailerId]
    );
    return res.rows[0];
  }

  async create(data: {
    retailerId: string;
    categoryId?: string;
    supplierId?: string;
    name: string;
    sku: string;
    barcode?: string;
    brand?: string;
    purchasePrice: number;
    sellingPrice: number;
    wholesalePrice?: number;
    discountPrice?: number;
    taxRate?: number;
    unit?: string;
    quantity: number;
    minStock?: number;
    maxStock?: number;
    imageUrl?: string;
    description?: string;
  }) {
    const res = await query(
      `INSERT INTO products (
        retailer_id, category_id, supplier_id, name, sku, barcode, brand,
        purchase_price, selling_price, wholesale_price, discount_price, tax_rate,
        unit, quantity, min_stock, max_stock, image_url, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        data.retailerId,
        data.categoryId || null,
        data.supplierId || null,
        data.name,
        data.sku,
        data.barcode || null,
        data.brand || null,
        data.purchasePrice,
        data.sellingPrice,
        data.wholesalePrice || 0,
        data.discountPrice || 0,
        data.taxRate || 0,
        data.unit || 'pcs',
        data.quantity,
        data.minStock || 5,
        data.maxStock || 100,
        data.imageUrl || null,
        data.description || null,
      ]
    );
    return res.rows[0];
  }

  async update(id: string, retailerId: string, data: any) {
    const res = await query(
      `UPDATE products SET
        category_id = $1, supplier_id = $2, name = $3, sku = $4, barcode = $5,
        brand = $6, purchase_price = $7, selling_price = $8, wholesale_price = $9,
        discount_price = $10, tax_rate = $11, unit = $12, quantity = $13,
        min_stock = $14, max_stock = $15, image_url = $16, description = $17,
        active = COALESCE($18, active), updated_at = CURRENT_TIMESTAMP
      WHERE id = $19 AND retailer_id = $20 RETURNING *`,
      [
        data.categoryId || null,
        data.supplierId || null,
        data.name,
        data.sku,
        data.barcode || null,
        data.brand || null,
        data.purchasePrice,
        data.sellingPrice,
        data.wholesalePrice || 0,
        data.discountPrice || 0,
        data.taxRate || 0,
        data.unit || 'pcs',
        data.quantity,
        data.minStock || 5,
        data.maxStock || 100,
        data.imageUrl || null,
        data.description || null,
        data.active,
        id,
        retailerId,
      ]
    );
    return res.rows[0];
  }

  async delete(id: string, retailerId: string) {
    const res = await query(
      'DELETE FROM products WHERE id = $1 AND retailer_id = $2 RETURNING id',
      [id, retailerId]
    );
    return res.rows[0];
  }
}