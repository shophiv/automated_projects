const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = await authService.registerUser(email, password);
      return res.status(201).json(result);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = await authService.authenticateUser(email, password);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }
}

module.exports = new AuthController();