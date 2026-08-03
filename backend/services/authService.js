const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

class AuthService {
  async registerUser(email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email,
      passwordHash,
    });

    return {
      id: user._id,
      email: user.email,
    };
  }

  async authenticateUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }
}

module.exports = new AuthService();