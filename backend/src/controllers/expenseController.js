const expenseService = require('../services/expenseService');

const createExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, description, date } = req.body;

    const expense = await expenseService.createExpense(userId, {
      amount,
      description,
      date
    });

    return res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createExpense
};