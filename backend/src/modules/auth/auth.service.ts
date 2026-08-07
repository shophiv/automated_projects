import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { ENV } from '../../config/env';

export class AuthService {
  private authRepo = new AuthRepository();

  async register(data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const result = await this.authRepo.createTenantAndOwner({
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      passwordHash,
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        tenant_id: result.tenant.id,
        email: result.user.email,
        role: result.user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return { token, user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }, tenant: result.tenant };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user || !user.is_active) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    await this.authRepo.updateLastLogin(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id } };
  }

  async getMe(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role, tenant_id: user.tenant_id };
  }
}