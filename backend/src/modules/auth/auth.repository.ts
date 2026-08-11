import { pool } from '../../config/database';

export class AuthRepository {
  async createRetailerAndOwner(
    businessName: string,
    ownerName: string,
    email: string,
    phone: string,
    address: string,
    passwordHash: string,
    client?: any
  ) {
    const db = client || pool;
    
    const retailerQuery = `
      INSERT INTO retailers (business_name, owner_name, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, business_name, owner_name, email, phone, address, created_at
    `;
    const retailerResult = await db.query(retailerQuery, [businessName, ownerName, email, phone, address]);
    const retailer = retailerResult.rows[0];

    const userQuery = `
      INSERT INTO users (retailer_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'Owner')
      RETURNING id, retailer_id, name, email, role, created_at
    `;
    const userResult = await db.query(userQuery, [retailer.id, ownerName, email, passwordHash]);
    const user = userResult.rows[0];

    return { retailer, user };
  }

  async findUserByEmail(email: string) {
    const query = `
      SELECT u.id, u.retailer_id, u.name, u.email, u.password_hash, u.role, r.business_name
      FROM users u
      JOIN retailers r ON u.retailer_id = r.id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async findUserById(id: number) {
    const query = `
      SELECT u.id, u.retailer_id, u.name, u.email, u.role, r.business_name
      FROM users u
      JOIN retailers r ON u.retailer_id = r.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}