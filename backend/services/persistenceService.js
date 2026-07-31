const User = require('../models/User');
const Expense = require('../models/Expense');

const verifyUserPersistence = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const error = new Error('User record persistence verification failed');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const verifyExpensePersistence = async (expenseId, userId) => {
  const expense = await Expense.findOne({ _id: expenseId, userId });
  if (!expense) {
    const error = new Error('Expense record persistence verification failed');
    error.statusCode = 404;
    throw error;
  }
  return expense;
};

const countUserExpenses = async (userId) => {
  const count = await Expense.countDocuments({ userId });
  return count;
};

module.exports = {
  verifyUserPersistence,
  verifyExpensePersistence,
  countUserExpenses
};