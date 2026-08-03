const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      // Stateless JWT logout is handled client-side by discarding the token.
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();