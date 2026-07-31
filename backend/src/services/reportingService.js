const Expense = require('../models/Expense');
const mongoose = require('mongoose');

const generateSummaryReport = async (userId) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);

  // Aggregate total spent and breakdown by category
  const aggregationResult = await Expense.aggregate([
    { $match: { userId: objectUserId } },
    {
      $group: {
        _id: '$categoryId',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
        total: 1,
        count: 1
      }
    },
    { $sort: { total: -1 } }
  ]);

  const totalSpent = aggregationResult.reduce((acc, curr) => acc + curr.total, 0);

  return {
    totalSpent: Number(totalSpent.toFixed(2)),
    categoryBreakdown: aggregationResult.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      total: Number(item.total.toFixed(2)),
      count: item.count
    }))
  };
};

module.exports = {
  generateSummaryReport
};