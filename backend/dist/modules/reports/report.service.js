"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const database_1 = require("../../config/database");
class ReportService {
    async generateReport(retailerId, reportType, format) {
        let data = {};
        switch (reportType) {
            case 'sales':
                const salesRes = await database_1.pool.query(`SELECT id, invoice_number, customer_name, total_amount, tax_amount, discount_amount, total_profit, payment_method, status, created_at FROM sales WHERE retailer_id = $1 ORDER BY created_at DESC`, [retailerId]);
                data = salesRes.rows;
                break;
            case 'inventory':
                const invRes = await database_1.pool.query(`SELECT id, name, sku, barcode, purchase_price, selling_price, quantity, min_stock, status FROM products WHERE retailer_id = $1`, [retailerId]);
                data = invRes.rows;
                break;
            case 'expenses':
                const expRes = await database_1.pool.query(`SELECT id, category, amount, description, expense_date FROM expenses WHERE retailer_id = $1 ORDER BY expense_date DESC`, [retailerId]);
                data = expRes.rows;
                break;
            case 'summary':
                const salesSum = await database_1.pool.query(`SELECT COALESCE(SUM(total_amount),0) as revenue, COALESCE(SUM(total_profit),0) as profit FROM sales WHERE retailer_id = $1 AND status='COMPLETED'`, [retailerId]);
                const expSum = await database_1.pool.query(`SELECT COALESCE(SUM(amount),0) as expenses FROM expenses WHERE retailer_id = $1`, [retailerId]);
                data = {
                    totalRevenue: salesSum.rows[0].revenue,
                    totalProfit: salesSum.rows[0].profit,
                    totalExpenses: expSum.rows[0].expenses,
                    netIncome: parseFloat(salesSum.rows[0].revenue) - parseFloat(expSum.rows[0].expenses)
                };
                break;
            default:
                throw new Error('Invalid report type specified');
        }
        if (format === 'csv') {
            return this.formatCSV(data);
        }
        else if (format === 'excel' || format === 'pdf') {
            // Return structured data for frontend or API client rendering
            return {
                format,
                reportType,
                generatedAt: new Date().toISOString(),
                data
            };
        }
        else {
            return { reportType, data };
        }
    }
    formatCSV(data) {
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map((row) => Object.values(row).map(val => `"${val ?? ''}"`).join(','));
            return [headers, ...rows].join('\n');
        }
        return 'No data available';
    }
}
exports.ReportService = ReportService;
