const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Please add an expense amount'],
    min: [0.01, 'Amount must be greater than zero']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);