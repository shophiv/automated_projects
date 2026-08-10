"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const database_1 = require("../config/database");
const accountingRepository_1 = require("../repositories/accountingRepository");
class ReportService {
    static async generateReportData(tenantId, reportType, startDate, endDate) {
        let dateFilter = '';
        const params = [tenantId];
        if (startDate && endDate) {
            dateFilter = ` AND sale_date BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }
        switch (reportType) {
            case 'sales': {
                const query = `SELECT * FROM sales_transactions WHERE tenant_id = $1 ${dateFilter} ORDER BY sale_date DESC;`;
                const { rows } = await database_1.pool.query(query, params);
                return { report_type: 'sales', data: rows };
            }
            case 'inventory': {
                const query = `SELECT * FROM products WHERE tenant_id = $1 AND archived_at IS NULL ORDER BY name ASC;`;
                const { rows } = await database_1.pool.query(query, [tenantId]);
                return { report_type: 'inventory', data: rows };
            }
            case 'profit': {
                const query = `
          SELECT 
            DATE(sale_date) as date,
            SUM(total_amount) as revenue,
            SUM(profit_amount) as profit
          FROM sales_transactions 
          WHERE tenant_id = $1 ${dateFilter}
          GROUP BY DATE(sale_date)
          ORDER BY date DESC;
        `;
                const { rows } = await database_1.pool.query(query, params);
                return { report_type: 'profit', data: rows };
            }
            case 'expense': {
                const { entries } = await accountingRepository_1.AccountingRepository.findByTenant(tenantId, 100, 0, 'expense');
                return { report_type: 'expense', data: entries };
            }
            case 'summary':
            default: {
                const summary = await accountingRepository_1.AccountingRepository.getFinancialSummary(tenantId, startDate, endDate);
                return { report_type: 'summary', data: summary };
            }
        }
    }
    static formatAsCSV(reportType, data) {
        if (!data || data.length === 0)
            return 'No data available';
        if (typeof data === 'object' && !Array.isArray(data)) {
            // Summary object
            const keys = Object.keys(data);
            const values = Object.values(data);
            return `${keys.join(',')}\n${values.join(',')}`;
        }
        const keys = Object.keys(data[0]);
        let csv = keys.join(',') + '\n';
        for (const row of data) {
            csv += keys.map((k) => `"${row[k] !== null && row[k] !== undefined ? row[k] : ''}"`).join(',') + '\n';
        }
        return csv;
    }
}
exports.ReportService = ReportService;
