const aiService = require('../services/aiService');

const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const analyticsData = await aiService.generateUserInsights(userId);

    res.status(200).json({
      status: 'success',
      data: analyticsData
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error generating AI analytics insights'
    });
  }
};

module.exports = {
  getInsights
};