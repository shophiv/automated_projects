"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingRepository = void 0;
const database_1 = require("../config/database");
class AccountingRepository {
    static async create(tenantId, data) {
        const query = `
      INSERT INTO accounting_entries (tenant_id, type, category, amount, reference_id, description, date)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))
      RETURNING *;
    `;
        const values = [
            tenantId,
            data.type,
            data.category,
            data.amount,
            data.reference_id || null,
            data.description || null,
            data.date || null,
        ];
        const { rows } = await database_1.pool.query(query, values);
        return rows[0];
    }
    static async findByTenant(tenantId, limit = 50, offset = 0, type) {
        let query = `SELECT * FROM accounting_entries WHERE tenant_id = $1`;
        let countQuery = `SELECT COUNT(*) FROM accounting_entries WHERE tenant_id = $1`;
        const params = [tenantId];
        if (type) {
            query += ` AND type = $2`;
            countQuery += ` AND type = $2`;
            params.push(type);
        }
        query += ` ORDER BY date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const queryParams = [...params, limit, offset];
        const { rows: entries } = await database_1.pool.query(query, queryParams);
        const { rows: countRows } = await database_1.pool.query(countQuery, params);
        return {
            entries,
            total: parseInt(countRows[0].count, 10),
        };
    }
    static async getFinancialSummary(tenantId, startDate, endDate) {
        let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
      FROM accounting_entries
      WHERE tenant_id = $1
    `;
        const params = [tenantId];
        if (startDate && endDate) {
            query += ` AND date BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }
        const { rows } = await database_1.pool.query(query, params);
        const totalIncome = parseFloat(rows[0].total_income || 0);
        const totalExpense = parseFloat(rows[0].total_expense || 0);
        return {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
        };
    }
}
exports.AccountingRepository = AccountingRepository;
