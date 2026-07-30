const validateExpense = (req, res, next) => {
  const { amount, category, date } = req.body;

  if (amount === undefined || amount === null || amount === '') {
    return res.status(400).json({
      status: 'fail',
      message: 'Expense amount is required'
    });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || typeof numericAmount !== 'number' || numericAmount <= 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Expense amount must be a valid numeric value greater than zero'
    });
  }

  if (!category) {
    return res.status(400).json({
      status: 'fail',
      message: 'Category is required'
    });
  }

  if (date && isNaN(Date.parse(date))) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid date format'
    });
  }

  // Normalize amount to number
  req.body.amount = numericAmount;
  next();
};

module.exports = {
  validateExpense
};