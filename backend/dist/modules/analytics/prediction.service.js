"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
const analytics_repository_1 = require("./analytics.repository");
class PredictionService {
    analyticsRepo = new analytics_repository_1.AnalyticsRepository();
    async getPredictions(retailerId) {
        const history = await this.analyticsRepo.getSalesHistoryForPrediction(retailerId);
        // Group sales by product
        const productSales = {};
        for (const row of history) {
            if (!productSales[row.product_id]) {
                productSales[row.product_id] = {
                    name: row.name,
                    totalQuantity: 0,
                    dailySales: {}
                };
            }
            productSales[row.product_id].totalQuantity += parseInt(row.quantity, 10);
            const dateKey = new Date(row.created_at).toISOString().split('T')[0];
            productSales[row.product_id].dailySales[dateKey] = (productSales[row.product_id].dailySales[dateKey] || 0) + parseInt(row.quantity, 10);
        }
        const predictions = [];
        for (const [productId, data] of Object.entries(productSales)) {
            // Simple Moving Average / Exponential Smoothing estimation for next 7 days demand
            const daysCount = Object.keys(data.dailySales).length || 1;
            const avgDailyDemand = data.totalQuantity / Math.max(daysCount, 30); // Normalize over 30 days
            const forecastedWeeklyDemand = Math.ceil(avgDailyDemand * 7);
            let movementType = 'NORMAL';
            if (avgDailyDemand > 3)
                movementType = 'FAST_MOVING';
            if (avgDailyDemand < 0.5)
                movementType = 'SLOW_MOVING';
            predictions.push({
                productId: parseInt(productId, 10),
                productName: data.name,
                averageDailyDemand: parseFloat(avgDailyDemand.toFixed(2)),
                forecastedWeeklyDemand,
                movementType,
                reorderSuggestion: forecastedWeeklyDemand > 0 ? `Recommend maintaining at least ${forecastedWeeklyDemand * 2} units in stock.` : 'Low demand.'
            });
        }
        // Sort by forecasted demand descending
        predictions.sort((a, b) => b.forecastedWeeklyDemand - a.forecastedWeeklyDemand);
        return {
            forecastPeriod: 'Next 7 Days',
            predictions
        };
    }
}
exports.PredictionService = PredictionService;
