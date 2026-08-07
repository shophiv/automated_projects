import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { ENV } from '../../config/env';

export class AuthService {
  private authRepo = new AuthRepository();

  async registerRetailer(data: {
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    const existingRetailer = await this.authRepo.findRetailerByEmail(data.email);
    if (existingRetailer) {
      const err: any = new Error('Retailer with this email already exists');
      err.statusCode = 400;
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);
    const defaultSubscriptionId = 'a0000000-0000-0000-0000-000000000001';

    const retailer = await this.authRepo.createRetailer({
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      passwordHash,
      phone: data.phone,
      address: data.address,
      subscriptionId: defaultSubscriptionId,
    });

    // Automatically create Owner user for the retailer
    const user = await this.authRepo.createUser({
      retailerId: retailer.id,
      name: data.ownerName,
      email: data.email,
      passwordHash,
      role: 'Owner',
    });

    const accessToken = jwt.sign(
      { userId: user.id, retailerId: retailer.id, role: user.role, email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, retailerId: retailer.id },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any }
    );

    return {
      accessToken,
      refreshToken,
      retailer: { id: retailer.id, businessName: retailer.business_name, email: retailer.email },
      user: { id: user.id, name: user.name, role: user.role }
    };
  }

  async login(data: { email: string; password: string }) {
    // Check in users table first
    let user = await this.authRepo.findUserByEmail(data.email);
    let retailerId = user?.retailer_id;

    if (!user) {
      const retailer = await this.authRepo.findRetailerByEmail(data.email);
      if (retailer) {
        user = {
          id: retailer.id,
          retailer_id: retailer.id,
          name: retailer.owner_name,
          email: retailer.email,
          password_hash: retailer.password_hash,
          role: 'Owner'
        };
        retailerId = retailer.id;
      }
    }

    if (!user) {
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const accessToken = jwt.sign(
      { userId: user.id, retailerId, role: user.role, email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, retailerId },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any }
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, role: user.role, email: user.email, retailerId }
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as any;
      const accessToken = jwt.sign(
        { userId: payload.userId, retailerId: payload.retailerId, role: payload.role || 'Owner', email: payload.email },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN as any }
      );
      return { accessToken };
    } catch (error) {
      const err: any = new Error('Invalid refresh token');
      err.statusCode = 403;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }
  }

  async createUser(retailerId: string, data: { name: string; email: string; password: string; role: string }) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);
    return await this.authRepo.createUser({
      retailerId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'Cashier'
    });
  }

  async getUsers(retailerId: string) {
    return await this.authRepo.findUsersByRetailerId(retailerId);
  }
}