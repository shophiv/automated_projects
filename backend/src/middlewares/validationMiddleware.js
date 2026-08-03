const {
  validateExpensePayload,
  validateCategoryPayload,
  validateAuthPayload
} = require('../utils/validationSchemas');

module.exports = {
  validateExpense: validateExpensePayload,
  validateCategory: validateCategoryPayload,
  validateAuth: validateAuthPayload
};