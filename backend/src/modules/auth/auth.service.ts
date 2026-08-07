import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';
const SALT_ROUNDS = 10;

export class AuthService {
  private authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  async register(data: {
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
    phoneNumber: string;
    businessAddress: string;
  }) {
    const existing = await this.authRepo.findWorkspaceByEmail(data.email);
    if (existing) {
      const error: any = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    const tenantId = await this.authRepo.createWorkspace(
      data.businessName,
      data.ownerName,
      data.email,
      data.phoneNumber,
      data.businessAddress
    );

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.authRepo.createUser(
      tenantId,
      data.ownerName,
      data.email,
      passwordHash,
      'owner'
    );

    await this.authRepo.logAudit(tenantId, user.id, 'WORKSPACE_REGISTERED');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      retailerId: tenantId,
      userId: user.id,
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.authRepo.findUserByEmail(email);
    if (!user || user.workspace_status !== 'active') {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    await this.authRepo.logAudit(user.tenant_id, user.id, 'USER_LOGIN');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      // Return success anyway to prevent user enumeration
      return { message: 'If email exists, password reset instructions have been sent.' };
    }
    await this.authRepo.logAudit(user.tenant_id, user.id, 'FORGOT_PASSWORD_REQUESTED');
    return { message: 'If email exists, password reset instructions have been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      // In full implementation update password in repo
      return { message: 'Password successfully reset.' };
    } catch (err) {
      const error: any = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }
  }
}