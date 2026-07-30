const Expense = require('../models/Expense');

const createExpense = async (userId, expenseData) => {
  const { amount, description, date, category } = expenseData;

  const expense = await Expense.create({
    amount,
    description: description ? description.trim() : '',
    date: date || Date.now(),
    user: userId,
    category
  });

  return await expense.populate('category', 'name description');
};

const getExpensesByUserId = async (userId) => {
  const expenses = await Expense.find({ user: userId })
    .populate('category', 'name description')
    .sort({ date: -1, createdAt: -1 });

  return expenses;
};

const updateExpense = async (expenseId, userId, updateData) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });

  if (!expense) {
    const error = new Error('Expense not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  const { amount, description, date, category } = updateData;

  if (amount !== undefined) {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error('Expense amount must be a valid numeric value greater than zero');
      error.statusCode = 400;
      throw error;
    }
    expense.amount = numericAmount;
  }

  if (description !== undefined) {
    expense.description = description ? description.trim() : '';
  }

  if (date !== undefined) {
    if (isNaN(Date.parse(date))) {
      const error = new Error('Invalid date format');
      error.statusCode = 400;
      throw error;
    }
    expense.date = date;
  }

  if (category !== undefined) {
    expense.category = category;
  }

  await expense.save();

  return await expense.populate('category', 'name description');
};

const deleteExpense = async (expenseId, userId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });

  if (!expense) {
    const error = new Error('Expense not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  await expense.deleteOne();

  return { id: expenseId, message: 'Expense deleted successfully' };
};

module.exports = {
  createExpense,
  getExpensesByUserId,
  updateExpense,
  deleteExpense
};