"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSRepository = void 0;
const database_1 = require("../../config/database");
class POSRepository {
    async findProductByBarcode(retailerId, barcode) {
        const query = `
      SELECT id, retailer_id, category_id, supplier_id, name, sku, barcode, brand, 
             purchase_price, selling_price, profit_margin, tax_rate, unit, quantity, 
             min_stock, max_stock, image_url, description, status, created_at
      FROM products
      WHERE retailer_id = $1 AND barcode = $2 AND status = 'active'
    `;
        const result = await database_1.pool.query(query, [retailerId, barcode]);
        return result.rows[0];
    }
    async createSale(retailerId, cashierId, invoiceNumber, customerName, totalAmount, taxAmount, discountAmount, totalProfit, paymentMethod, items, client) {
        const db = client || database_1.pool;
        const saleQuery = `
      INSERT INTO sales (retailer_id, invoice_number, customer_name, total_amount, tax_amount, discount_amount, total_profit, cashier_id, payment_method, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed')
      RETURNING id, retailer_id, invoice_number, customer_name, total_amount, tax_amount, discount_amount, total_profit, cashier_id, payment_method, status, created_at
    `;
        const saleRes = await db.query(saleQuery, [
            retailerId,
            invoiceNumber,
            customerName || 'Walk-in Customer',
            totalAmount,
            taxAmount,
            discountAmount,
            totalProfit,
            cashierId,
            paymentMethod
        ]);
        const sale = saleRes.rows[0];
        const createdItems = [];
        for (const item of items) {
            const itemQuery = `
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price, cost_price, profit)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, sale_id, product_id, quantity, unit_price, total_price, cost_price, profit
      `;
            const itemRes = await db.query(itemQuery, [
                sale.id,
                item.productId,
                item.quantity,
                item.unitPrice,
                item.totalPrice,
                item.costPrice,
                item.profit
            ]);
            createdItems.push(itemRes.rows[0]);
        }
        return { ...sale, items: createdItems };
    }
}
exports.POSRepository = POSRepository;
