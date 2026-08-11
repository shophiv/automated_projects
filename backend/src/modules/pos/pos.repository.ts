import { pool } from '../../config/database';

export class POSRepository {
  async findProductByBarcode(retailerId: number, barcode: string) {
    const query = `
      SELECT id, retailer_id, category_id, supplier_id, name, sku, barcode, brand, 
             purchase_price, selling_price, profit_margin, tax_rate, unit, quantity, 
             min_stock, max_stock, image_url, description, status, created_at
      FROM products
      WHERE retailer_id = $1 AND barcode = $2 AND status = 'active'
    `;
    const result = await pool.query(query, [retailerId, barcode]);
    return result.rows[0];
  }

  async createSale(
    retailerId: number,
    cashierId: number,
    invoiceNumber: string,
    customerName: string | undefined,
    totalAmount: number,
    taxAmount: number,
    discountAmount: number,
    totalProfit: number,
    paymentMethod: string,
    items: Array<{
      productId: number;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      costPrice: number;
      profit: number;
    }>,
    client?: any
  ) {
    const db = client || pool;

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