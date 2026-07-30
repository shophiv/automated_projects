const Expense = require('../models/Expense');
const axios = require('axios');

const generateUserInsights = async (userId) => {
  const expenses = await Expense.find({ user: userId }).populate('category', 'name description').sort({ date: -1 });

  if (!expenses || expenses.length === 0) {
    return {
      summary: {
        totalSpent: 0,
        totalTransactions: 0,
        categoryBreakdown: []
      },
      insights: "You have not recorded any expenses yet. Start logging expenses to receive AI-powered financial insights and spending summaries."
    };
  }

  // Calculate summary metrics
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalTransactions = expenses.length;

  const categoryMap = {};
  expenses.forEach((exp) => {
    const catName = exp.category ? exp.category.name : 'Uncategorized';
    if (!categoryMap[catName]) {
      categoryMap[catName] = 0;
    }
    categoryMap[catName] += exp.amount;
  });

  const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    total: categoryMap[cat],
    percentage: ((categoryMap[cat] / totalSpent) * 100).toFixed(1)
  })).sort((a, b) => b.total - a.total);

  // Construct prompt payload for AI provider if API key is present
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  let aiInsightsText = "";

  const expenseSummaryString = expenses.map(e => 
    `- $${e.amount.toFixed(2)} on ${e.category?.name || 'General'} (${e.description || 'No description'}) on ${new Date(e.date).toLocaleDateString()}`
  ).join('\n');

  if (apiKey) {
    try {
      const prompt = `You are a financial advisor AI. Analyze the following user expenses and provide 3 actionable, concise financial insights or budgeting tips:\n\nTotal Spent: $${totalSpent.toFixed(2)}\nCategory Breakdown:\n${categoryBreakdown.map(c => `${c.category}: $${c.total.toFixed(2)} (${c.percentage}%)`).join('\n')}\n\nRecent Transactions:\n${expenseSummaryString}`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful personal finance assistant providing concise insights.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        aiInsightsText = response.data.choices[0].message.content.trim();
      }
    } catch (err) {
      console.error('External AI API error:', err.response?.data || err.message);
      aiInsightsText = `Based on your recent spending of $${totalSpent.toFixed(2)}, your highest expense category is ${categoryBreakdown[0]?.category || 'N/A'} at ${categoryBreakdown[0]?.percentage || 0}%. Consider reviewing discretionary spending in this category to optimize your budget. (Note: External AI service temporarily unavailable; generated from fallback analytics engine).`;
    }
  } else {
    // Fallback rule-based smart insights if no API key configured
    const topCategory = categoryBreakdown[0];
    aiInsightsText = `Smart Financial Insight: You have spent a total of $${totalSpent.toFixed(2)} across ${totalTransactions} transactions. Your top spending category is ${topCategory.category}, accounting for ${topCategory.percentage}% of your total expenses ($${topCategory.total.toFixed(2)}). Consider setting a monthly budget cap for ${topCategory.category} to maintain healthy savings.`;
  }

  return {
    summary: {
      totalSpent,
      totalTransactions,
      categoryBreakdown
    },
    insights: aiInsightsText
  };
};

module.exports = {
  generateUserInsights
};