const categoryService = require('../services/categoryService');

class CategoryController {
  async createCategory(req, res) {
    try {
      const userId = req.user.id;
      const { name } = req.body;
      const category = await categoryService.createCategory(userId, name);

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCategories(req, res) {
    try {
      const userId = req.user.id;
      const categories = await categoryService.getCategories(userId);

      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CategoryController();