import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_retail_key';
const SALT_ROUNDS = 10;

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
  async register(dto: RegisterDTO) {
    const client = await query('BEGIN');
    try {
      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [dto.email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists.');
      }

      // Create tenant
      const tenantResult = await query(
        'INSERT INTO tenants (name) VALUES ($1) RETURNING id, name, created_at',
        [dto.tenantName]
      );
      const tenant = tenantResult.rows[0];

      // Hash password
      const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      const role = dto.role || 'retailer_owner';

      // Create user
      const userResult = await query(
        'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, tenant_id, email, role, created_at',
        [tenant.id, dto.email, passwordHash, role]
      );
      const user = userResult.rows[0];

      await query('COMMIT');

      const token = jwt.sign(
        { userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id,
          tenantName: tenant.name,
        },
      };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  async login(dto: LoginDTO) {
    const userResult = await query(
      `SELECT u.id, u.tenant_id, u.email, u.password_hash, u.role, t.name as tenant_name 
       FROM users u 
       JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1`,
      [dto.email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password.');
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(dto.password, user.password_hash);

    if (!validPassword) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
      },
    };
  }
}