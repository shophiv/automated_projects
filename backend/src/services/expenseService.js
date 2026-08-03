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

  async updateExpense(userId, expenseId, expenseData) {
    const { categoryId, amount, date, description } = expenseData;

    // Verify expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: Number(expenseId),
        user_id: userId
      }
    });

    if (!existingExpense) {
      throw new Error('Expense not found or unauthorized');
    }

    const updateData = {};

    if (categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: {
          id: Number(categoryId),
          user_id: userId
        }
      });
      if (!category) {
        throw new Error('Category not found or does not belong to user');
      }
      updateData.category_id = Number(categoryId);
    }

    if (amount !== undefined) {
      updateData.amount = Number(amount);
    }

    if (date !== undefined) {
      updateData.date = new Date(date);
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: Number(expenseId) },
      data: updateData,
      include: {
        category: true
      }
    });

    return updatedExpense;
  }

  async deleteExpense(userId, expenseId) {
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: Number(expenseId),
        user_id: userId
      }
    });

    if (!existingExpense) {
      throw new Error('Expense not found or unauthorized');
    }

    await prisma.expense.delete({
      where: { id: Number(expenseId) }
    });

    return { message: 'Expense deleted successfully' };
  }
}

module.exports = new ExpenseService();