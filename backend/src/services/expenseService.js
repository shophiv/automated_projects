const Expense = require('../models/Expense');

const createExpense = async (userId, expenseData) => {
  const { amount, description, date } = expenseData;

  if (amount === undefined || amount === null) {
    throw new Error('Please provide an expense amount');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  const expense = await Expense.create({
    userId,
    amount,
    description: description || '',
    date: date ? new Date(date) : Date.now()
  });

  return expense;
};

const getExpensesByUserId = async (userId) => {
  const expenses = await Expense.find({ userId }).sort({ date: -1, createdAt: -1 });
  return expenses;
};

const updateExpense = async (expenseId, userId, updateData) => {
  const expense = await Expense.findOne({ _id: expenseId, userId });

  if (!expense) {
    throw new Error('Expense not found or unauthorized');
  }

  const { amount, description, date } = updateData;

  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Expense amount must be a positive number');
    }
    expense.amount = amount;
  }

  if (description !== undefined) {
    expense.description = description;
  }

  if (date !== undefined) {
    expense.date = new Date(date);
  }

  await expense.save();
  return expense;
};

const deleteExpense = async (expenseId, userId) => {
  const expense = await Expense.findOne({ _id: expenseId, userId });

  if (!expense) {
    throw new Error('Expense not found or unauthorized');
  }

  await Expense.deleteOne({ _id: expenseId });
  return { message: 'Expense deleted successfully' };
};

module.exports = {
  createExpense,
  getExpensesByUserId,
  updateExpense,
  deleteExpense
};