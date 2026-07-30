const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, validateExpense, expenseController.createExpense)
  .get(protect, expenseController.getExpenses);

router.route('/:id')
  .put(protect, validateExpense, expenseController.updateExpense)
  .delete(protect, expenseController.deleteExpense);

module.exports = router;