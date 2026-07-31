const expenseService = require('../services/expenseService');

const getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await expenseService.getExpensesByUser(userId);
    res.status(200).json({
      status: 'success',
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

const addExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const expense = await expenseService.createExpense(userId, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;
    const expense = await expenseService.updateExpense(expenseId, userId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;
    await expenseService.deleteExpense(expenseId, userId);
    res.status(200).json({
      status: 'success',
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};