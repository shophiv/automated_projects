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

module.exports = {
  createExpense,
  getExpensesByUserId
};