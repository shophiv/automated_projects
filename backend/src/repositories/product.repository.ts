import { pool } from '../config/database.js';
import { Product, CreateProductDTO, UpdateProductDTO } from '../models/product.model.js';

export class ProductRepository {
  async findAllByTenant(tenantId: number): Promise<Product[]> {
    const query = 'SELECT * FROM products WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  }

  async findByIdAndTenant(id: number, tenantId: number): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1 AND tenant_id = $2';
    const result = await pool.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  async create(tenantId: number, dto: CreateProductDTO): Promise<Product> {
    const query = `
      INSERT INTO products (tenant_id, name, sku, barcode, cost_price, retail_price, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      tenantId,
      dto.name,
      dto.sku,
      dto.barcode || null,
      dto.cost_price,
      dto.retail_price,
      dto.stock_quantity,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(id: number, tenantId: number, dto: UpdateProductDTO): Promise<Product | null> {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    const name = dto.name !== undefined ? dto.name : existing.name;
    const sku = dto.sku !== undefined ? dto.sku : existing.sku;
    const barcode = dto.barcode !== undefined ? dto.barcode : existing.barcode;
    const cost_price = dto.cost_price !== undefined ? dto.cost_price : existing.cost_price;
    const retail_price = dto.retail_price !== undefined ? dto.retail_price : existing.retail_price;
    const stock_quantity = dto.stock_quantity !== undefined ? dto.stock_quantity : existing.stock_quantity;

    const query = `
      UPDATE products
      SET name = $1, sku = $2, barcode = $3, cost_price = $4, retail_price = $5, stock_quantity = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `;
    const values = [name, sku, barcode, cost_price, retail_price, stock_quantity, id, tenantId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number, tenantId: number): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1 AND tenant_id = $2';
    const result = await pool.query(query, [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }
}