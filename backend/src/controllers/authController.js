const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);
    return res.status(201).json({
      success: true,
      token: result.token,
      user: {
        id: result._id,
        email: result.email
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      token: result.token,
      user: {
        id: result._id,
        email: result.email
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login
};