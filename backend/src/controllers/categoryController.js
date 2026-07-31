const categoryService = require('../services/categoryService');

const getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;
    const categories = await categoryService.getCategoriesForUser(userId);

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCustomCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const category = await categoryService.createCustomCategory(userId, { name });

    return res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCategories,
  createCustomCategory
};