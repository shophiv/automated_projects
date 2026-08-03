const { prisma } = require('../config/db');

class ExpenseService {
  async createExpense(userId, expenseData) {
    const { categoryId, amount, date, description } = expenseData;

    if (!categoryId || !amount || !date) {
      throw new Error('CategoryId, amount, and date are required');
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: Number(categoryId),
        user_id: userId
      }
    });

    if (!category) {
      throw new Error('Category not found or does not belong to user');
    }

    const expense = await prisma.expense.create({
      data: {
        user_id: userId,
        category_id: Number(categoryId),
        amount: Number(amount),
        date: new Date(date),
        description: description || null
      },
      include: {
        category: true
      }
    });

    return expense;
  }
}

module.exports = new ExpenseService();