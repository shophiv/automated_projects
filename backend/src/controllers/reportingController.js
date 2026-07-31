const reportingService = require('../services/reportingService');

const getSummaryReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period } = req.query;

    if (period && !['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period parameter. Allowed values: daily, weekly, monthly'
      });
    }

    const report = await reportingService.generateSummaryReport(userId, period);

    return res.status(200).json({
      success: true,
      period: report.period,
      data: {
        totalSpent: report.totalSpent,
        categoryBreakdown: report.categoryBreakdown
      }
    });
  } catch (error) {
    const statusCode = error.message.includes('Invalid period') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSummaryReport
};