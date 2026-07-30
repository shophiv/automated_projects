const categoryService = require('../services/categoryService');

const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error fetching categories'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await categoryService.createCategory({ name, description });
    res.status(201).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Error creating category'
    });
  }
};

module.exports = {
  getCategories,
  createCategory
};