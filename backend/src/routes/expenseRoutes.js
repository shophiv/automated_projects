const express = require('express');
const expenseController = require('../controllers/expenseController');
const verifyToken = require('../middlewares/authMiddleware');
const { validateExpense } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.use(verifyToken);

router.post('/', validateExpense, expenseController.createExpense);

module.exports = router;