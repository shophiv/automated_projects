import { query } from '../../shared/database/connection';

export class AuthRepository {
  async findRetailerByEmail(email: string) {
    const res = await query('SELECT * FROM retailers WHERE email = $1', [email]);
    return res.rows[0];
  }

  async findUserByEmail(email: string) {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  async createRetailer(data: {
    businessName: string;
    ownerName: string;
    email: string;
    passwordHash: string;
    phone?: string;
    address?: string;
    subscriptionId: string;
  }) {
    const res = await query(
      `INSERT INTO retailers (business_name, owner_name, email, password_hash, phone, address, subscription_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.businessName, data.ownerName, data.email, data.passwordHash, data.phone, data.address, data.subscriptionId]
    );
    return res.rows[0];
  }

  async createUser(data: {
    retailerId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }) {
    const res = await query(
      `INSERT INTO users (retailer_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.retailerId, data.name, data.email, data.passwordHash, data.role]
    );
    return res.rows[0];
  }

  async findUsersByRetailerId(retailerId: string) {
    const res = await query('SELECT id, retailer_id, name, email, role, status, created_at FROM users WHERE retailer_id = $1', [retailerId]);
    return res.rows;
  }
}