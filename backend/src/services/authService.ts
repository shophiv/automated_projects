import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { withTransaction } from '../utils/transaction';
import { AuditService } from './auditService';
import { TokenPayload } from '../middleware/auth';

export class AuthService {
  static async registerRetailer(data: {
    business_name: string;
    owner_name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) {
    return withTransaction(async (client) => {
      // Check existing email
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [data.email]);
      if (existingUser.rows.length > 0) {
        throw new Error('Email is already registered.');
      }

      // Create Tenant
      const tenantResult = await client.query(
        `INSERT INTO tenants (business_name, owner_name, email, phone, address, status)
         VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
        [data.business_name, data.owner_name, data.email, data.phone, data.address]
      );
      const tenant = tenantResult.rows[0];

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create Owner User
      const userResult = await client.query(
        `INSERT INTO users (tenant_id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'Owner') RETURNING id, tenant_id, name, email, role, created_at`,
        [tenant.id, data.owner_name, data.email, passwordHash]
      );
      const user = userResult.rows[0];

      await AuditService.logAction(tenant.id, user.id, 'TENANT_REGISTERED', {
        business_name: tenant.business_name,
      });

      const tokenPayload: TokenPayload = {
        userId: user.id,
        tenantId: tenant.id,
        role: user.role,
        email: user.email,
      };

      const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
      const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

      return { tenant, user, token };
    });
  }

  static async login(data: { email: string; password: string }) {
    const userResult = await pool.query(
      `SELECT u.*, t.status as tenant_status FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1`,
      [data.email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password.');
    }

    const user = userResult.rows[0];

    if (user.tenant_status !== 'active') {
      throw new Error('Tenant account is suspended or inactive.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      await AuditService.logAction(user.tenant_id, user.id, 'LOGIN_FAILED', { reason: 'Incorrect password' });
      throw new Error('Invalid email or password.');
    }

    await AuditService.logAction(user.tenant_id, user.id, 'LOGIN_SUCCESS', {});

    const tokenPayload: TokenPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        tenantId: user.tenant_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async getUserProfile(userId: string) {
    const result = await pool.query(
      `SELECT u.id, u.tenant_id, u.name, u.email, u.role, u.created_at,
              t.business_name, t.status as tenant_status
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found.');
    }

    return result.rows[0];
  }
}