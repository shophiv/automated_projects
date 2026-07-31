const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(categoryController.getCategories)
  .post(categoryController.createCustomCategory);

module.exports = router;