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

const updateExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;
    const updatedExpense = await expenseService.updateExpense(expenseId, userId, req.body);

    res.status(200).json({
      status: 'success',
      data: updatedExpense
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error updating expense entry'
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;
    const result = await expenseService.deleteExpense(expenseId, userId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error deleting expense entry'
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};