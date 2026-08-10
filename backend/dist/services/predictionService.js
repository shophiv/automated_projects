"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
const database_1 = require("../config/database");
class PredictionService {
    static async generateForecasts(tenantId) {
        // Basic statistical moving average / demand forecasting
        const query = `
      SELECT 
        DATE(sale_date) as sale_day,
        SUM(total_amount) as daily_total
      FROM sales_transactions
      WHERE tenant_id = $1 AND status = 'completed'
      GROUP BY sale_day
      ORDER BY sale_day DESC
      LIMIT 14;
    `;
        const { rows } = await database_1.pool.query(query, [tenantId]);
        let predictedTomorrowSales = 0;
        if (rows.length > 0) {
            const sum = rows.reduce((acc, row) => acc + parseFloat(row.daily_total), 0);
            predictedTomorrowSales = sum / rows.length;
        }
        // Reorder suggestions (products where quantity <= min_stock)
        const reorderQuery = `
      SELECT id, name, sku, quantity, min_stock, max_stock
      FROM products
      WHERE tenant_id = $1 AND archived_at IS NULL AND quantity <= min_stock;
    `;
        const { rows: reorderRows } = await database_1.pool.query(reorderQuery, [tenantId]);
        const reorderSuggestions = reorderRows.map((p) => ({
            product_id: p.id,
            name: p.name,
            sku: p.sku,
            current_stock: p.quantity,
            min_stock: p.min_stock,
            suggested_order_qty: Math.max(0, p.max_stock - p.quantity),
        }));
        return {
            predicted_tomorrow_sales: Math.round(predictedTomorrowSales * 100) / 100,
            predicted_weekly_sales: Math.round(predictedTomorrowSales * 7 * 100) / 100,
            reorder_suggestions: reorderSuggestions,
        };
    }
}
exports.PredictionService = PredictionService;
