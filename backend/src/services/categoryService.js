const Category = require('../models/Category');

const seedPredefinedCategories = async () => {
  const defaultCategories = [
    'Food & Dining',
    'Housing & Rent',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Healthcare',
    'Other'
  ];

  for (const catName of defaultCategories) {
    const existing = await Category.findOne({ name: catName, type: 'predefined', userId: null });
    if (!existing) {
      await Category.create({
        name: catName,
        type: 'predefined',
        userId: null
      });
    }
  }
};

const getCategoriesForUser = async (userId) => {
  await seedPredefinedCategories();
  const categories = await Category.find({
    $or: [
      { type: 'predefined' },
      { userId: userId }
    ]
  }).sort({ type: 1, name: 1 });

  return categories;
};

const createCustomCategory = async (userId, categoryData) => {
  const { name } = categoryData;

  if (!name || !name.trim()) {
    throw new Error('Please provide a category name');
  }

  const existing = await Category.findOne({
    name: name.trim(),
    userId: userId,
    type: 'custom'
  });

  if (existing) {
    throw new Error('Custom category already exists with this name');
  }

  const category = await Category.create({
    name: name.trim(),
    type: 'custom',
    userId: userId
  });

  return category;
};

module.exports = {
  seedPredefinedCategories,
  getCategoriesForUser,
  createCustomCategory
};