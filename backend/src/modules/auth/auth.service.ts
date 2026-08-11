import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { transactionManager } from '../../config/database';

export class AuthService {
  private authRepository = new AuthRepository();

  async register(payload: {
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    address?: string;
    password: string;
  }) {
    const existing = await this.authRepository.findUserByEmail(payload.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    if (payload.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(payload.password, saltRounds);

    const result = await transactionManager.runInTransaction(async (client) => {
      return await this.authRepository.createRetailerAndOwner(
        payload.businessName,
        payload.ownerName,
        payload.email,
        payload.phone || '',
        payload.address || '',
        passwordHash,
        client
      );
    });

    const token = this.generateToken({
      userId: result.user.id,
      retailerId: result.user.retailer_id,
      role: result.user.role,
      email: result.user.email
    });

    const refreshToken = this.generateRefreshToken({
      userId: result.user.id
    });

    return {
      retailer: result.retailer,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token,
      refreshToken
    };
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.authRepository.findUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken({
      userId: user.id,
      retailerId: user.retailer_id,
      role: user.role,
      email: user.email
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id
    });

    return {
      user: {
        id: user.id,
        retailerId: user.retailer_id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.business_name
      },
      token,
      refreshToken
    };
  }

  async refreshToken(token: string) {
    const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
    try {
      const decoded = jwt.verify(token, secret) as any;
      const user = await this.authRepository.findUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken({
        userId: user.id,
        retailerId: user.retailer_id,
        role: user.role,
        email: user.email
      });

      return { token: newToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      // Return success even if not found for security best practice
      return { message: 'If the email exists, a password reset link has been sent.' };
    }
    // In production, send reset email. Here we issue a signed token placeholder.
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
    return { message: 'Password reset link sent', resetToken };
  }

  private generateToken(payload: object): string {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jwt.sign(payload, secret, { expiresIn: '8h' });
  }

  private generateRefreshToken(payload: object): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }
}