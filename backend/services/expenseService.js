const Expense = require('../models/Expense');

const getExpensesByUser = async (userId) => {
  const expenses = await Expense.find({ userId }).sort({ date: -1, createdAt: -1 });
  return expenses;
};

const createExpense = async (userId, expenseData) => {
  const { title, amount, category, date } = expenseData;

  if (!title || amount === undefined || !category || !date) {
    const error = new Error('Please provide title, amount, category, and date');
    error.statusCode = 400;
    throw error;
  }

  if (Number(amount) <= 0) {
    const error = new Error('Amount must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  const expense = await Expense.create({
    userId,
    title,
    amount: Number(amount),
    category,
    date: new Date(date)
  });

  return expense;
};

const updateExpense = async (expenseId, userId, expenseData) => {
  const { title, amount, category, date } = expenseData;

  let expense = await Expense.findById(expenseId);

  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  if (expense.userId.toString() !== userId.toString()) {
    const error = new Error('Not authorized to update this expense');
    error.statusCode = 403;
    throw error;
  }

  if (amount !== undefined && Number(amount) <= 0) {
    const error = new Error('Amount must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (amount !== undefined) updateFields.amount = Number(amount);
  if (category !== undefined) updateFields.category = category;
  if (date !== undefined) updateFields.date = new Date(date);

  expense = await Expense.findByIdAndUpdate(expenseId, updateFields, {
    new: true,
    runValidators: true
  });

  return expense;
};

const deleteExpense = async (expenseId, userId) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  if (expense.userId.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this expense');
    error.statusCode = 403;
    throw error;
  }

  await Expense.findByIdAndDelete(expenseId);
  return { id: expenseId };
};

module.exports = {
  getExpensesByUser,
  createExpense,
  updateExpense,
  deleteExpense
};