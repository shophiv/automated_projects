const aiService = require('../services/aiService');

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const insights = await aiService.generateAiRecommendations(userId);

    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getRecommendations
};