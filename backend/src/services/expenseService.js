const Expense = require('../models/Expense');
const Category = require('../models/Category');

const validateCategoryAccess = async (categoryId, userId) => {
  if (!categoryId) {
    throw new Error('Please provide a category ID');
  }

  const category = await Category.findOne({
    _id: categoryId,
    $or: [
      { type: 'predefined' },
      { userId: userId }
    ]
  });

  if (!category) {
    throw new Error('Invalid category or unauthorized access');
  }

  return category;
};

const createExpense = async (userId, expenseData) => {
  const { amount, description, date, categoryId } = expenseData;

  if (amount === undefined || amount === null) {
    throw new Error('Please provide an expense amount');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  await validateCategoryAccess(categoryId, userId);

  const expense = await Expense.create({
    userId,
    categoryId,
    amount,
    description: description || '',
    date: date ? new Date(date) : Date.now()
  });

  return await expense.populate('categoryId');
};

const getExpensesByUserId = async (userId) => {
  const expenses = await Expense.find({ userId })
    .populate('categoryId')
    .sort({ date: -1, createdAt: -1 });
  return expenses;
};

const updateExpense = async (expenseId, userId, updateData) => {
  const expense = await Expense.findOne({ _id: expenseId, userId });

  if (!expense) {
    throw new Error('Expense not found or unauthorized');
  }

  const { amount, description, date, categoryId } = updateData;

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

  if (categoryId !== undefined) {
    await validateCategoryAccess(categoryId, userId);
    expense.categoryId = categoryId;
  }

  await expense.save();
  return await expense.populate('categoryId');
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