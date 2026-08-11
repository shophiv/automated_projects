import { pool } from '../../config/database';

export class AccountingRepository {
  async recordExpense(retailerId: number, category: string, amount: number, description: string, expenseDate?: string) {
    const query = `
      INSERT INTO expenses (retailer_id, category, amount, description, expense_date)
      VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
      RETURNING *
    `;
    const res = await pool.query(query, [retailerId, category, amount, description, expenseDate || null]);
    return res.rows[0];
  }

  async getExpenses(retailerId: number, queryParams: { startDate?: string; endDate?: string; category?: string }) {
    let query = `SELECT * FROM expenses WHERE retailer_id = $1`;
    const params: any[] = [retailerId];
    let paramIndex = 2;

    if (queryParams.startDate) {
      query += ` AND expense_date >= $${paramIndex++}`;
      params.push(queryParams.startDate);
    }
    if (queryParams.endDate) {
      query += ` AND expense_date <= $${paramIndex++}`;
      params.push(queryParams.endDate);
    }
    if (queryParams.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(queryParams.category);
    }

    query += ` ORDER BY expense_date DESC`;
    const res = await pool.query(query, params);
    return res.rows;
  }

  async getGeneralLedger(retailerId: number) {
    // Combine sales income and expenses into general ledger view
    const salesQuery = `
      SELECT id as reference_id, 'SALE' as type, total_amount as amount, created_at as entry_date, CONCAT('Invoice #', invoice_number) as description
      FROM sales
      WHERE retailer_id = $1 AND status = 'COMPLETED'
    `;
    const expensesQuery = `
      SELECT id as reference_id, 'EXPENSE' as type, amount, expense_date as entry_date, CONCAT('Expense [', category, ']: ', description) as description
      FROM expenses
      WHERE retailer_id = $1
    `;

    const salesRes = await pool.query(salesQuery, [retailerId]);
    const expensesRes = await pool.query(expensesQuery, [retailerId]);

    const ledger = [...salesRes.rows, ...expensesRes.rows].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
    return ledger;
  }

  async getTrialBalance(retailerId: number) {
    const salesSumQuery = `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM sales WHERE retailer_id = $1 AND status = 'COMPLETED'`;
    const expensesSumQuery = `SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE retailer_id = $1`;

    const salesRes = await pool.query(salesSumQuery, [retailerId]);
    const expensesRes = await pool.query(expensesSumQuery, [retailerId]);

    const revenue = parseFloat(salesRes.rows[0].total_revenue);
    const expenses = parseFloat(expensesRes.rows[0].total_expenses);

    return {
      accounts: [
        { accountCode: '1000', accountName: 'Cash / Bank', type: 'Asset', debit: revenue, credit: expenses },
        { accountCode: '4000', accountName: 'Sales Revenue', type: 'Revenue', debit: 0, credit: revenue },
        { accountCode: '5000', accountName: 'Operating Expenses', type: 'Expense', debit: expenses, credit: 0 }
      ],
      netProfit: revenue - expenses
    };
  }
}