import { pool } from '../../config/database';

export interface UserEntity {
  id: number;
  tenant_id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'retailer';
  created_at: Date;
  updated_at: Date;
}

export class AuthRepository {
  async findUserByEmailAndTenant(email: string, tenantId: number): Promise<UserEntity | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND tenant_id = $2';
    const result = await pool.query(query, [email, tenantId]);
    return result.rows[0] || null;
  }

  async findUserById(id: number): Promise<UserEntity | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }
}