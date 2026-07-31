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

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenses = await expenseService.getExpensesByUserId(userId);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;
    const { amount, description, date } = req.body;

    const updatedExpense = await expenseService.updateExpense(expenseId, userId, {
      amount,
      description,
      date
    });

    return res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.id;

    const result = await expenseService.deleteExpense(expenseId, userId);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};