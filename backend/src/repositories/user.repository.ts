import { pool } from '../config/database.js';
import { User, Tenant } from '../models/user.model.js';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async findAllTenants(): Promise<Tenant[]> {
    const query = 'SELECT * FROM tenants ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  async createTenant(name: string, subscriptionStatus: string = 'active'): Promise<Tenant> {
    const query = 'INSERT INTO tenants (name, subscription_status) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [name, subscriptionStatus]);
    return result.rows[0];
  }

  async createUser(tenantId: number | null, email: string, passwordHash: string, role: 'admin' | 'retailer'): Promise<User> {
    const query = 'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(query, [tenantId, email, passwordHash, role]);
    return result.rows[0];
  }
}