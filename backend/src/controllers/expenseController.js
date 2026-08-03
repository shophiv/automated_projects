const expenseService = require('../services/expenseService');

class ExpenseController {
  async createExpense(req, res) {
    try {
      const userId = req.user.id;
      const expense = await expenseService.createExpense(userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateExpense(req, res) {
    try {
      const userId = req.user.id;
      const expenseId = req.params.id;
      const expense = await expenseService.updateExpense(userId, expenseId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: expense
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') || error.message.includes('unauthorized') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteExpense(req, res) {
    try {
      const userId = req.user.id;
      const expenseId = req.params.id;
      await expenseService.deleteExpense(userId, expenseId);

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') || error.message.includes('unauthorized') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ExpenseController();