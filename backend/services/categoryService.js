const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Food', description: 'Groceries, restaurants, and dining out' },
  { name: 'Transport', description: 'Public transit, fuel, rideshares, and vehicle maintenance' },
  { name: 'Utilities', description: 'Electricity, water, gas, internet, and phone bills' },
  { name: 'Entertainment', description: 'Movies, games, subscriptions, and leisure activities' },
  { name: 'Housing', description: 'Rent, mortgage, and home maintenance' }
];

const seedCategories = async () => {
  try {
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

const getAllCategories = async () => {
  return await Category.find({}).sort({ name: 1 });
};

const createCategory = async (categoryData) => {
  const { name, description } = categoryData;
  if (!name) {
    const error = new Error('Category name is required');
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    const error = new Error('Category already exists');
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({
    name: name.trim(),
    description: description ? description.trim() : ''
  });

  return category;
};

module.exports = {
  seedCategories,
  getAllCategories,
  createCategory
};