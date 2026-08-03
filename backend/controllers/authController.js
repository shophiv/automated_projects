const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await authService.registerUser(email, password);
      return res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const { token, user } = await authService.authenticateUser(email, password);

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ message: 'Logged in successfully', user });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      });
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getSession(req, res, next) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.userId).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();