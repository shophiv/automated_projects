const expenseService = require('../services/expenseService');

const createExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const expense = await expenseService.createExpense(userId, req.body);
    
    res.status(201).json({
      status: 'success',
      data: expense
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error creating expense entry'
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await expenseService.getExpensesByUserId(userId);

    res.status(200).json({
      status: 'success',
      results: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error retrieving expense entries'
    });
  }
};

module.exports = {
  createExpense,
  getExpenses
};