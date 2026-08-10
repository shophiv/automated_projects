"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesRepository = void 0;
const database_1 = require("../config/database");
class SalesRepository {
    static async createTransaction(client, data) {
        const saleQuery = `
      INSERT INTO sales_transactions (
        tenant_id, invoice_number, customer_name, total_amount, tax_amount, 
        discount_amount, profit_amount, cashier_id, payment_method, status, sale_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;
        const saleValues = [
            data.tenant_id,
            data.invoice_number,
            data.customer_name || 'Walk-in Customer',
            data.total_amount,
            data.tax_amount,
            data.discount_amount,
            data.profit_amount,
            data.cashier_id,
            data.payment_method,
            data.status,
        ];
        const saleResult = await client.query(saleQuery, saleValues);
        const sale = saleResult.rows[0];
        for (const item of data.items) {
            const itemQuery = `
        INSERT INTO sale_items (
          sale_id, product_id, quantity, unit_price, total_price, cost_price
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
            await client.query(itemQuery, [
                sale.id,
                item.product_id,
                item.quantity,
                item.unit_price,
                item.total_price,
                item.cost_price,
            ]);
        }
        return sale;
    }
    static async findSales(tenantId, filters, limit = 50, offset = 0) {
        let queryCondition = 'WHERE tenant_id = $1';
        const queryParams = [tenantId];
        let paramIndex = 2;
        if (filters?.search) {
            queryCondition += ` AND (invoice_number ILIKE $${paramIndex} OR customer_name ILIKE $${paramIndex})`;
            queryParams.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters?.status) {
            queryCondition += ` AND status = $${paramIndex}`;
            queryParams.push(filters.status);
            paramIndex++;
        }
        if (filters?.startDate && filters?.endDate) {
            queryCondition += ` AND sale_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            queryParams.push(filters.startDate, filters.endDate);
            paramIndex += 2;
        }
        const countQuery = `SELECT COUNT(*) FROM sales_transactions ${queryCondition}`;
        const countRes = await database_1.pool.query(countQuery, queryParams);
        const total = parseInt(countRes.rows[0].count, 10);
        const dataQuery = `
      SELECT st.*, u.name as cashier_name 
      FROM sales_transactions st
      LEFT JOIN users u ON st.cashier_id = u.id
      ${queryCondition}
      ORDER BY st.sale_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        queryParams.push(limit, offset);
        const dataRes = await database_1.pool.query(dataQuery, queryParams);
        return { sales: dataRes.rows, total };
    }
    static async findById(tenantId, saleId) {
        const saleRes = await database_1.pool.query(`SELECT st.*, u.name as cashier_name 
       FROM sales_transactions st
       LEFT JOIN users u ON st.cashier_id = u.id
       WHERE st.tenant_id = $1 AND st.id = $2`, [tenantId, saleId]);
        if (saleRes.rows.length === 0)
            return null;
        const sale = saleRes.rows[0];
        const itemsRes = await database_1.pool.query(`SELECT si.*, p.name as product_name, p.sku as product_sku
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`, [saleId]);
        sale.items = itemsRes.rows;
        return sale;
    }
    static async updateStatus(client, tenantId, saleId, status) {
        const res = await client.query(`UPDATE sales_transactions 
       SET status = $1 
       WHERE tenant_id = $2 AND id = $3 
       RETURNING *`, [status, tenantId, saleId]);
        return res.rows[0];
    }
}
exports.SalesRepository = SalesRepository;
