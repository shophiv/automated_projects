const Expense = require('../models/Expense');
const mongoose = require('mongoose');

const generateSummaryReport = async (userId, period) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const matchStage = { userId: objectUserId };

  if (period) {
    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      // Start of week (Sunday or Monday, let's use 7 days ago or start of week)
      const dayOfWeek = now.getDay();
      const diffToStart = now.getDate() - dayOfWeek;
      startDate = new Date(now.setDate(diffToStart));
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      throw new Error('Invalid period parameter. Allowed values: daily, weekly, monthly');
    }

    matchStage.date = { $gte: startDate };
  }

  // Aggregate total spent and breakdown by category
  const aggregationResult = await Expense.aggregate([
    { $match: matchStage },
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
    period: period || 'all',
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