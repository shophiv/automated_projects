import { pool } from '../../config/database';

export interface CategoryEntity {
  id: number;
  tenant_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductEntity {
  id: number;
  tenant_id: number;
  category_id: number | null;
  name: string;
  sku: string;
  barcode: string | null;
  purchase_price: number;
  selling_price: number;
  created_at: Date;
  updated_at: Date;
}

export class ProductRepository {
  async findCategoriesByTenant(tenantId: number): Promise<CategoryEntity[]> {
    const query = 'SELECT * FROM categories WHERE tenant_id = $1 ORDER BY name ASC';
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  async findCategoryById(id: number, tenantId: number): Promise<CategoryEntity | null> {
    const query = 'SELECT * FROM categories WHERE id = $1 AND tenant_id = $2';
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  async createCategory(tenantId: number, name: string): Promise<CategoryEntity> {
    const query = `
      INSERT INTO categories (tenant_id, name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [tenantId, name]);
    return result.rows[0];
  }

  async updateCategory(id: number, tenantId: number, name: string): Promise<CategoryEntity | null> {
    const query = `
      UPDATE categories
      SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [name, id, tenantId]);
    return result.rows[0] || null;
  }

  async deleteCategory(id: number, tenantId: number): Promise<boolean> {
    const query = 'DELETE FROM categories WHERE id = $1 AND tenant_id = $2';
    const result = await pool.query(query, [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  async findProductsByTenant(tenantId: number, search?: string, categoryId?: number): Promise<ProductEntity[]> {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    query += ' ORDER BY p.name ASC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findProductById(id: number, tenantId: number): Promise<ProductEntity | null> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.tenant_id = $2
    `;
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  async findProductByBarcode(barcode: string, tenantId: number): Promise<ProductEntity | null> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.barcode = $1 AND p.tenant_id = $2
    `;
    const result = await pool.query(query, [barcode, tenantId]);
    return result.rows[0] || null;
  }

  async createProduct(
    tenantId: number,
    categoryId: number | null,
    name: string,
    sku: string,
    barcode: string | null,
    purchasePrice: number,
    sellingPrice: number
  ): Promise<ProductEntity> {
    const query = `
      INSERT INTO products (tenant_id, category_id, name, sku, barcode, purchase_price, selling_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      tenantId,
      categoryId || null,
      name,
      sku,
      barcode || null,
      purchasePrice,
      sellingPrice
    ]);
    return result.rows[0];
  }

  async updateProduct(
    id: number,
    tenantId: number,
    categoryId: number | null,
    name: string,
    sku: string,
    barcode: string | null,
    purchasePrice: number,
    sellingPrice: number
  ): Promise<ProductEntity | null> {
    const query = `
      UPDATE products
      SET category_id = $1, name = $2, sku = $3, barcode = $4, purchase_price = $5, selling_price = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [
      categoryId || null,
      name,
      sku,
      barcode || null,
      purchasePrice,
      sellingPrice,
      id,
      tenantId
    ]);
    return result.rows[0] || null;
  }

  async deleteProduct(id: number, tenantId: number): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1 AND tenant_id = $2';
    const result = await pool.query(query, [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }
}