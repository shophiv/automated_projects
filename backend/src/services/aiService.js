const Expense = require('../models/Expense');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const generateAiRecommendations = async (userId) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);

  // Fetch all user expenses with populated category
  const expenses = await Expense.find({ userId: objectUserId })
    .populate('categoryId')
    .sort({ date: -1 });

  // Compute total spent and aggregate by category
  const categoryMap = {};
  let totalSpent = 0;

  expenses.forEach(exp => {
    totalSpent += exp.amount;
    const catName = exp.categoryId ? exp.categoryId.name : 'Uncategorized';
    if (!categoryMap[catName]) {
      categoryMap[catName] = { total: 0, count: 0 };
    }
    categoryMap[catName].total += exp.amount;
    categoryMap[catName].count += 1;
  });

  const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
    category: cat,
    total: Number(categoryMap[cat].total.toFixed(2)),
    count: categoryMap[cat].count
  })).sort((a, b) => b.total - a.total);

  // If OpenAI API key is configured and available, we can optionally attempt to call OpenAI SDK or fetch.
  // For robustness, we implement both an intelligent rule/heuristic fallback analysis and optional OpenAI integration if OPENAI_API_KEY is present.
  let spendingPatternAnalysis = '';
  let predictiveAnalysis = '';
  let recommendations = [];

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    try {
      // Dynamic import or fetch to OpenAI API
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey });

      const prompt = `Analyze the following expense data for a user and provide JSON response with fields: spendingPatternAnalysis (string), predictiveAnalysis (string), recommendations (array of strings).
Total Spent: ${totalSpent}
Category Breakdown: ${JSON.stringify(categoryBreakdown)}
Recent Transactions Count: ${expenses.length}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const aiResult = JSON.parse(completion.choices[0].message.content);
      spendingPatternAnalysis = aiResult.spendingPatternAnalysis || '';
      predictiveAnalysis = aiResult.predictiveAnalysis || '';
      recommendations = aiResult.recommendations || [];
    } catch (aiError) {
      console.error('AI API Error, falling back to algorithmic analysis:', aiError.message);
    }
  }

  // Fallback or deterministic intelligent financial analysis if AI is not configured or failed
  if (!spendingPatternAnalysis || recommendations.length === 0) {
    if (expenses.length === 0) {
      spendingPatternAnalysis = 'No expense records found. Start logging your daily expenses to receive personalized AI spending pattern analysis.';
      predictiveAnalysis = 'Insufficient data for predictive financial modeling.';
      recommendations = [
        'Record your first daily expense to kickstart your budgeting journey.',
        'Explore predefined categories to organize your financial transactions.'
      ];
    } else {
      const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'General';
      const highestAmount = categoryBreakdown.length > 0 ? categoryBreakdown[0].total : 0;
      const percentage = totalSpent > 0 ? ((highestAmount / totalSpent) * 100).toFixed(1) : 0;

      spendingPatternAnalysis = `Your highest spending category is ${highestCategory}, accounting for $${highestAmount} (${percentage}% of your total recorded spending of $${totalSpent}).`;
      predictiveAnalysis = `Based on your recent transaction frequency and average daily spend of $${(totalSpent / (categoryBreakdown.length > 0 ? 30 : 1)).toFixed(2)}, your projected monthly expenditure remains steady within your current habits.`;
      
      recommendations = [
        `Consider setting a monthly budget cap for ${highestCategory} to optimize your savings.`,
        'Try to allocate at least 20% of your incoming funds towards savings and emergency reserves.',
        'Review recurring expenses weekly to identify and eliminate discretionary spending.'
      ];
    }
  }

  return {
    spendingPatternAnalysis,
    predictiveAnalysis,
    recommendations
  };
};

module.exports = {
  generateAiRecommendations
};