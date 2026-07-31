const reportingService = require('../services/reportingService');

const getSummaryReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const report = await reportingService.generateSummaryReport(userId);

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSummaryReport
};