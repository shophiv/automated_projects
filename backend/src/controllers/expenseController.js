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
}

module.exports = new ExpenseController();