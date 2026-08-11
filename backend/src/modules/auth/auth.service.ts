import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { Prisma } from '@prisma/client';

export class AuthService {
  async registerTenant(dto: {
    business_name: string;
    owner_name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) {
    const existingUser = await db.user.findUnique({ where: { email: dto.email } });
    const existingTenant = await db.tenant.findUnique({ where: { email: dto.email } });

    if (existingUser || existingTenant) {
      throw new AppError('Email is already registered', 400);
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(dto.password, saltRounds);

    const result = await db.$transaction(async (prisma: Prisma.TransactionClient) => {
      const tenant = await prisma.tenant.create({
        data: {
          business_name: dto.business_name,
          owner_name: dto.owner_name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          status: 'PENDING',
        },
      });

      const user = await prisma.user.create({
        data: {
          tenant_id: tenant.id,
          name: dto.owner_name,
          email: dto.email,
          password_hash,
          role: 'OWNER',
          phone: dto.phone,
        },
      });

      await prisma.auditLog.create({
        data: {
          tenant_id: tenant.id,
          user_id: user.id,
          action: 'REGISTER_TENANT',
          details: `Tenant ${tenant.business_name} registered successfully.`,
        },
      });

      return { tenant, user };
    });

    const token = this.generateToken({
      id: result.user.id,
      tenant_id: result.tenant.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      token,
      tenant: result.tenant,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await db.user.findUnique({ where: { email: dto.email } });
    let admin = null;

    if (!user) {
      admin = await db.admin.findUnique({ where: { email: dto.email } });
      if (!admin) {
        throw new AppError('Invalid email or password', 401);
      }

      const isPasswordValid = await bcrypt.compare(dto.password, admin.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = this.generateToken({
        id: admin.id,
        email: admin.email,
        role: 'ADMIN',
      });

      return {
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'ADMIN',
        },
      };
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tenant = await db.tenant.findUnique({ where: { id: user.tenant_id } });
    if (tenant && tenant.status === 'SUSPENDED') {
      throw new AppError('Tenant account is suspended. Contact administrator.', 403);
    }

    const token = this.generateToken({
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      tenant,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }
  }

  async resetPassword(dto: { email: string; token: string; new_password: string }) {
    const user = await db.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new AppError('Invalid user or token', 400);
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(dto.new_password, saltRounds);

    await db.user.update({
      where: { email: dto.email },
      data: { password_hash },
    });
  }

  private generateToken(payload: any): string {
    const secret = process.env.JWT_SECRET || 'supersecretkey';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }
}