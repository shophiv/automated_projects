import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository, UserEntity } from './auth.repository';
import { AppError } from '../../middleware/error.middleware';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(email: string, password: string, tenantId?: number): Promise<{ token: string; user: Omit<UserEntity, 'password_hash'> }> {
    let user: UserEntity | null = null;

    if (tenantId) {
      user = await this.authRepository.findUserByEmailAndTenant(email, tenantId);
    } else {
      user = await this.authRepository.findUserByEmail(email);
    }

    if (!user) {
      const error: AppError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error: AppError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key';
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role
      },
      secret,
      { expiresIn: '12h' }
    );

    const { password_hash, ...userProfile } = user;
    return { token, user: userProfile };
  }

  async getSession(userId: number): Promise<Omit<UserEntity, 'password_hash'>> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const { password_hash, ...userProfile } = user;
    return userProfile;
  }
}