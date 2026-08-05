import { query } from '../../config/database';

export interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  barcode?: string;
  initialQuantity?: number;
  lowStockThreshold?: number;
}

export interface UpdateProductDTO {
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  barcode?: string;
}

export class ProductService {
  async getProducts(tenantId: number) {
    const result = await query(
      `SELECT p.id, p.tenant_id, p.sku, p.name, p.description, p.price, p.cost, p.barcode, p.status, p.created_at, p.updated_at,
              COALESCE(i.quantity, 0) as quantity, COALESCE(i.low_stock_threshold, 5) as low_stock_threshold
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id AND p.tenant_id = i.tenant_id
       WHERE p.tenant_id = $1
       ORDER BY p.name ASC`,
      [tenantId]
    );
    return result.rows;
  }

  async getProductById(tenantId: number, productId: number) {
    const result = await query(
      `SELECT p.id, p.tenant_id, p.sku, p.name, p.description, p.price, p.cost, p.barcode, p.status, p.created_at, p.updated_at,
              COALESCE(i.quantity, 0) as quantity, COALESCE(i.low_stock_threshold, 5) as low_stock_threshold
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id AND p.tenant_id = i.tenant_id
       WHERE p.tenant_id = $1 AND p.id = $2`,
      [tenantId, productId]
    );
    if (result.rows.length === 0) {
      throw new Error('Product not found.');
    }
    return result.rows[0];
  }

  async createProduct(tenantId: number, dto: CreateProductDTO) {
    const client = await query('BEGIN');
    try {
      // Check SKU uniqueness per tenant
      const existingSku = await query(
        'SELECT id FROM products WHERE tenant_id = $1 AND sku = $2',
        [tenantId, dto.sku]
      );
      if (existingSku.rows.length > 0) {
        throw new Error('Product with this SKU already exists in your workspace.');
      }

      const productResult = await query(
        `INSERT INTO products (tenant_id, sku, name, description, price, cost, barcode, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING id, tenant_id, sku, name, description, price, cost, barcode, status, created_at, updated_at`,
        [tenantId, dto.sku, dto.name, dto.description || null, dto.price, dto.cost, dto.barcode || null]
      );
      const product = productResult.rows[0];

      const quantity = dto.initialQuantity !== undefined ? dto.initialQuantity : 0;
      const threshold = dto.lowStockThreshold !== undefined ? dto.lowStockThreshold : 5;

      const inventoryResult = await query(
        `INSERT INTO inventory (tenant_id, product_id, quantity, low_stock_threshold)
         VALUES ($1, $2, $3, $4)
         RETURNING quantity, low_stock_threshold`,
        [tenantId, product.id, quantity, threshold]
      );

      await query('COMMIT');

      return {
        ...product,
        quantity: inventoryResult.rows[0].quantity,
        low_stock_threshold: inventoryResult.rows[0].low_stock_threshold,
      };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  async updateProduct(tenantId: number, productId: number, dto: UpdateProductDTO) {
    const existing = await this.getProductById(tenantId, productId);
    if (!existing) {
      throw new Error('Product not found.');
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const existingSku = await query(
        'SELECT id FROM products WHERE tenant_id = $1 AND sku = $2 AND id <> $3',
        [tenantId, dto.sku, productId]
      );
      if (existingSku.rows.length > 0) {
        throw new Error('Another product with this SKU already exists.');
      }
    }

    const updatedResult = await query(
      `UPDATE products 
       SET sku = COALESCE($1, sku),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           cost = COALESCE($5, cost),
           barcode = COALESCE($6, barcode),
           updated_at = CURRENT_TIMESTAMP
       WHERE tenant_id = $7 AND id = $8
       RETURNING id, tenant_id, sku, name, description, price, cost, barcode, status, created_at, updated_at`,
      [
        dto.sku !== undefined ? dto.sku : null,
        dto.name !== undefined ? dto.name : null,
        dto.description !== undefined ? dto.description : null,
        dto.price !== undefined ? dto.price : null,
        dto.cost !== undefined ? dto.cost : null,
        dto.barcode !== undefined ? dto.barcode : null,
        tenantId,
        productId,
      ]
    );

    return this.getProductById(tenantId, productId);
  }

  async deleteProduct(tenantId: number, productId: number) {
    await this.getProductById(tenantId, productId);
    await query('DELETE FROM products WHERE tenant_id = $1 AND id = $2', [tenantId, productId]);
    return { success: true };
  }

  async duplicateProduct(tenantId: number, productId: number) {
    const source = await this.getProductById(tenantId, productId);
    const newSku = `${source.sku}-COPY-${Date.now().toString().slice(-4)}`;
    const newName = `${source.name} (Copy)`;

    return this.createProduct(tenantId, {
      sku: newSku,
      name: newName,
      description: source.description,
      price: Number(source.price),
      cost: Number(source.cost),
      barcode: source.barcode ? `${source.barcode}-C` : undefined,
      initialQuantity: Number(source.quantity),
      lowStockThreshold: Number(source.low_stock_threshold),
    });
  }

  async archiveProduct(tenantId: number, productId: number) {
    await this.getProductById(tenantId, productId);
    const result = await query(
      `UPDATE products 
       SET status = CASE WHEN status = 'active' THEN 'archived' ELSE 'active' END,
           updated_at = CURRENT_TIMESTAMP
       WHERE tenant_id = $1 AND id = $2
       RETURNING id, status`,
      [tenantId, productId]
    );
    return this.getProductById(tenantId, productId);
  }
}