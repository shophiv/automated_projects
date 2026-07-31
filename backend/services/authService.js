const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

class AuthService {
  async registerUser(email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      email,
      passwordHash
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user._id,
        email: user.email
      }
    };
  }

  async authenticateUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user._id,
        email: user.email
      }
    };
  }
}

module.exports = new AuthService();