const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
};

const validateDate = (dateString) => {
  // Checks YYYY-MM-DD format and valid calendar date
  if (!dateString || typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;

  return date.toISOString().startsWith(dateString);
};

const validateCategoryName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

const validateExpensePayload = (req, res, next) => {
  const { amount, date, description, categoryId } = req.body;
  const errors = [];

  if (amount !== undefined && !validateAmount(amount)) {
    errors.push('Amount must be a valid positive number.');
  }

  if (date !== undefined && !validateDate(date)) {
    errors.push('Date must be in valid YYYY-MM-DD format.');
  }

  if (description !== undefined && typeof description === 'string' && description.length > 255) {
    errors.push('Description cannot exceed 255 characters.');
  }

  if (categoryId !== undefined && (isNaN(Number(categoryId)) || Number(categoryId) <= 0)) {
    errors.push('CategoryId must be a valid positive integer.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  next();
};

const validateCategoryPayload = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || !validateCategoryName(name)) {
    errors.push('Category name is required and must be between 1 and 50 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  next();
};

const validateAuthPayload = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateExpensePayload,
  validateCategoryPayload,
  validateAuthPayload,
  validateAmount,
  validateDate,
  validateCategoryName,
  validateEmail
};