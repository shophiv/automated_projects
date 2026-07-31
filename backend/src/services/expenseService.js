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

module.exports = {
  createExpense
};