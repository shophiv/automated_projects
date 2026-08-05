import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { User } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async authenticate(email: string, password: string):Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

    const { password_hash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}