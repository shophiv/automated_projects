import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabaseConnection } from '../../config/database';

export interface RegisterDTO {
  tenantName: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  private db = getDatabaseConnection();

  async register(data: RegisterDTO) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // 1. Create Tenant Workspace
      const tenantResult = await client.query(
        'INSERT INTO tenants (name, subscription_status, storage_usage) VALUES ($1, $2, $3) RETURNING id, name, subscription_status, storage_usage, created_at',
        [data.tenantName, 'active', 0]
      );
      const tenant = tenantResult.rows[0];

      // 2. Hash Password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // 3. Create Admin User for Tenant
      const role = data.role || 'admin';
      const userResult = await client.query(
        'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, tenant_id, email, role, created_at',
        [tenant.id, data.email, passwordHash, role]
      );
      const user = userResult.rows[0];

      await client.query('COMMIT');

      const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';
      const token = jwt.sign(
        {
          id: user.id,
          tenantId: user.tenant_id,
          role: user.role,
          email: user.email,
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        token,
        tenant,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(data: LoginDTO) {
    const result = await this.db.query(
      'SELECT id, tenant_id, email, password_hash, role FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key';
    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenant_id,
        role: user.role,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        tenantId: user.tenant_id,
        email: user.email,
        role: user.role,
      },
    };
  }
}