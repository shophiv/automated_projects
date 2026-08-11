import { pool } from '../../config/database';

export class ProductRepository {
  async create(retailerId: number, data: any) {
    const query = `
      INSERT INTO products (
        retailer_id, category_id, supplier_id, name, sku, barcode, brand,
        purchase_price, selling_price, profit_margin, tax_rate, unit,
        quantity, min_stock, max_stock, image_url, description, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    const result = await pool.query(query, [
      retailerId,
      data.categoryId || null,
      data.supplierId || null,
      data.name,
      data.sku,
      data.barcode || null,
      data.brand || null,
      data.purchasePrice || 0.00,
      data.sellingPrice || 0.00,
      data.profitMargin || 0.00,
      data.taxRate || 0.00,
      data.unit || 'pcs',
      data.quantity || 0,
      data.minStock || 5,
      data.maxStock || 1000,
      data.imageUrl || null,
      data.description || null,
      data.status || 'active'
    ]);
    return result.rows[0];
  }

  async findById(productId: number, retailerId: number) {
    const query = `
      SELECT p.*, c.name as category_name, s.business_name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1 AND p.retailer_id = $2
    `;
    const result = await pool.query(query, [productId, retailerId]);
    return result.rows[0];
  }

  async findAll(retailerId: number, queryParams: { search?: string; categoryId?: string; limit?: string; offset?: string }) {
    let query = `
      SELECT p.*, c.name as category_name, s.business_name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.retailer_id = $1
    `;
    const params: any[] = [retailerId];
    let paramIndex = 2;

    if (queryParams.search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode = $${paramIndex})`;
      params.push(`%${queryParams.search}%`);
      paramIndex++;
    }

    if (queryParams.categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(queryParams.categoryId);
      paramIndex++;
    }

    query += ` ORDER BY p.name ASC`;

    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;
    const offset = queryParams.offset ? parseInt(queryParams.offset, 10) : 0;

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async update(productId: number, retailerId: number, data: any) {
    const query = `
      UPDATE products
      SET category_id = COALESCE($3, category_id),
          supplier_id = COALESCE($4, supplier_id),
          name = COALESCE($5, name),
          sku = COALESCE($6, sku),
          barcode = COALESCE($7, barcode),
          brand = COALESCE($8, brand),
          purchase_price = COALESCE($9, purchase_price),
          selling_price = COALESCE($10, selling_price),
          profit_margin = COALESCE($11, profit_margin),
          tax_rate = COALESCE($12, tax_rate),
          unit = COALESCE($13, unit),
          quantity = COALESCE($14, quantity),
          min_stock = COALESCE($15, min_stock),
          max_stock = COALESCE($16, max_stock),
          image_url = COALESCE($17, image_url),
          description = COALESCE($18, description),
          status = COALESCE($19, status)
      WHERE id = $1 AND retailer_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [
      productId,
      retailerId,
      data.categoryId,
      data.supplierId,
      data.name,
      data.sku,
      data.barcode,
      data.brand,
      data.purchasePrice,
      data.sellingPrice,
      data.profitMargin,
      data.taxRate,
      data.unit,
      data.quantity,
      data.minStock,
      data.maxStock,
      data.imageUrl,
      data.description,
      data.status
    ]);
    return result.rows[0];
  }

  async delete(productId: number, retailerId: number) {
    const query = `
      DELETE FROM products
      WHERE id = $1 AND retailer_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [productId, retailerId]);
    return result.rows[0];
  }

  async duplicate(productId: number, retailerId: number) {
    const product = await this.findById(productId, retailerId);
    if (!product) return null;

    const newSku = `${product.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
    const newName = `${product.name} (Copy)`;

    const query = `
      INSERT INTO products (
        retailer_id, category_id, supplier_id, name, sku, barcode, brand,
        purchase_price, selling_price, profit_margin, tax_rate, unit,
        quantity, min_stock, max_stock, image_url, description, status
      )
      VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const result = await pool.query(query, [
      retailerId,
      product.category_id,
      product.supplier_id,
      newName,
      newSku,
      product.brand,
      product.purchase_price,
      product.selling_price,
      product.profit_margin,
      product.tax_rate,
      product.unit,
      0, // new copy starts with 0 inventory or same quantity depending on policy, let's set 0
      product.min_stock,
      product.max_stock,
      product.image_url,
      product.description,
      product.status
    ]);
    return result.rows[0];
  }
}