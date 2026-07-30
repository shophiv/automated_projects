const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, categoryController.getCategories)
  .post(protect, categoryController.createCategory);

module.exports = router;