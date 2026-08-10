import { pool } from '../config/database';
import { AccountingRepository } from '../repositories/accountingRepository';

export class ReportService {
  static async generateReportData(tenantId: string, reportType: string, startDate?: string, endDate?: string) {
    let dateFilter = '';
    const params: any[] = [tenantId];

    if (startDate && endDate) {
      dateFilter = ` AND sale_date BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }

    switch (reportType) {
      case 'sales': {
        const query = `SELECT * FROM sales_transactions WHERE tenant_id = $1 ${dateFilter} ORDER BY sale_date DESC;`;
        const { rows } = await pool.query(query, params);
        return { report_type: 'sales', data: rows };
      }
      case 'inventory': {
        const query = `SELECT * FROM products WHERE tenant_id = $1 AND archived_at IS NULL ORDER BY name ASC;`;
        const { rows } = await pool.query(query, [tenantId]);
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
        const { rows } = await pool.query(query, params);
        return { report_type: 'profit', data: rows };
      }
      case 'expense': {
        const { entries } = await AccountingRepository.findByTenant(tenantId, 100, 0, 'expense');
        return { report_type: 'expense', data: entries };
      }
      case 'summary':
      default: {
        const summary = await AccountingRepository.getFinancialSummary(tenantId, startDate, endDate);
        return { report_type: 'summary', data: summary };
      }
    }
  }

  static formatAsCSV(reportType: string, data: any[]): string {
    if (!data || data.length === 0) return 'No data available';
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