import { pool } from '../../config/database';

export class SupplierRepository {
  async create(retailerId: number, data: {
    businessName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    outstandingBalance?: number;
    notes?: string;
    status?: string;
  }) {
    const query = `
      INSERT INTO suppliers (retailer_id, business_name, contact_person, phone, email, address, outstanding_balance, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, retailer_id, business_name, contact_person, phone, email, address, outstanding_balance, notes, status, created_at
    `;
    const result = await pool.query(query, [
      retailerId,
      data.businessName,
      data.contactPerson || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.outstandingBalance || 0.00,
      data.notes || null,
      data.status || 'active'
    ]);
    return result.rows[0];
  }

  async findById(supplierId: number, retailerId: number) {
    const query = `
      SELECT id, retailer_id, business_name, contact_person, phone, email, address, outstanding_balance, notes, status, created_at
      FROM suppliers
      WHERE id = $1 AND retailer_id = $2
    `;
    const result = await pool.query(query, [supplierId, retailerId]);
    return result.rows[0];
  }

  async findAll(retailerId: number) {
    const query = `
      SELECT id, retailer_id, business_name, contact_person, phone, email, address, outstanding_balance, notes, status, created_at
      FROM suppliers
      WHERE retailer_id = $1
      ORDER BY business_name ASC
    `;
    const result = await pool.query(query, [retailerId]);
    return result.rows;
  }

  async update(supplierId: number, retailerId: number, data: any) {
    const query = `
      UPDATE suppliers
      SET business_name = COALESCE($3, business_name),
          contact_person = COALESCE($4, contact_person),
          phone = COALESCE($5, phone),
          email = COALESCE($6, email),
          address = COALESCE($7, address),
          outstanding_balance = COALESCE($8, outstanding_balance),
          notes = COALESCE($9, notes),
          status = COALESCE($10, status)
      WHERE id = $1 AND retailer_id = $2
      RETURNING id, retailer_id, business_name, contact_person, phone, email, address, outstanding_balance, notes, status, created_at
    `;
    const result = await pool.query(query, [
      supplierId,
      retailerId,
      data.businessName,
      data.contactPerson,
      data.phone,
      data.email,
      data.address,
      data.outstandingBalance,
      data.notes,
      data.status
    ]);
    return result.rows[0];
  }

  async delete(supplierId: number, retailerId: number) {
    const query = `
      DELETE FROM suppliers
      WHERE id = $1 AND retailer_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [supplierId, retailerId]);
    return result.rows[0];
  }

  async getReports(supplierId: number, retailerId: number) {
    const supplier = await this.findById(supplierId, retailerId);
    if (!supplier) return null;

    const productsQuery = `
      SELECT id, name, sku, purchase_price, selling_price, quantity
      FROM products
      WHERE supplier_id = $1 AND retailer_id = $2
    `;
    const productsResult = await pool.query(productsQuery, [supplierId, retailerId]);

    return {
      supplier,
      productsCount: productsResult.rows.length,
      products: productsResult.rows
    };
  }
}