import prisma from '../../config/database';
import { Role } from '@prisma/client';

export class AuthRepository {
  async findTenantByEmail(email: string) {
    return await prisma.tenant.findUnique({ where: { email } });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async createTenantAndOwner(data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    passwordHash: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          business_name: data.businessName,
          owner_name: data.ownerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
        },
      });

      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          name: data.ownerName,
          email: data.email,
          password_hash: data.passwordHash,
          role: Role.OWNER,
        },
      });

      return { tenant, user };
    });
  }

  async updateLastLogin(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { last_login: new Date() },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });
  }
}