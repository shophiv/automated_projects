import { pool } from '../config/database';
import { SalesRepository, SaleItemData } from '../repositories/salesRepository';
import { InventoryRepository } from '../repositories/inventoryRepository';

export interface CartItemInput {
  product_id: string;
  quantity: number;
}

export interface CheckoutInput {
  items: CartItemInput[];
  customer_name?: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'split';
  discount_amount?: number;
  tax_rate?: number;
}

export class PosService {
  static async checkout(tenantId: string, cashierId: string, data: CheckoutInput): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let subtotal = 0;
      let totalCost = 0;
      const processedItems: SaleItemData[] = [];

      for (const itemInput of data.items) {
        const prodRes = await client.query(
          'SELECT * FROM products WHERE tenant_id = $1 AND id = $2 AND archived_at IS NULL',
          [tenantId, itemInput.product_id]
        );

        if (prodRes.rows.length === 0) {
          throw new Error(`Product not found or archived: ${itemInput.product_id}`);
        }

        const product = prodRes.rows[0];
        if (product.quantity < itemInput.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}`);
        }

        const unitPrice = parseFloat(product.selling_price);
        const costPrice = parseFloat(product.purchase_price);
        const lineTotal = unitPrice * itemInput.quantity;
        const lineCost = costPrice * itemInput.quantity;

        subtotal += lineTotal;
        totalCost += lineCost;

        processedItems.push({
          product_id: product.id,
          quantity: itemInput.quantity,
          unit_price: unitPrice,
          total_price: lineTotal,
          cost_price: lineCost,
        });

        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity - itemInput.quantity;

        await client.query('UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2', [
          newQuantity,
          product.id,
        ]);

        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        await InventoryRepository.createLog(client, {
          tenantId,
          productId: product.id,
          userId: cashierId,
          type: 'sale',
          quantityChange: -itemInput.quantity,
          previousQuantity,
          newQuantity,
          reference: invoiceNumber,
        });
      }

      const discount = data.discount_amount || 0;
      const taxableAmount = Math.max(0, subtotal - discount);
      const taxRate = data.tax_rate !== undefined ? data.tax_rate : 0.05; // 5% default tax
      const taxAmount = taxableAmount * taxRate;
      const totalAmount = taxableAmount + taxAmount;
      const profitAmount = totalAmount - totalCost - taxAmount;

      const invoiceNumber = `INV-${Date.now()}`;

      const transactionData = {
        tenant_id: tenantId,
        invoice_number: invoiceNumber,
        customer_name: data.customer_name || 'Walk-in Customer',
        total_amount: parseFloat(totalAmount.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        discount_amount: parseFloat(discount.toFixed(2)),
        profit_amount: parseFloat(profitAmount.toFixed(2)),
        cashier_id: cashierId,
        payment_method: data.payment_method,
        status: 'completed',
        items: processedItems,
      };

      const saleRecord = await SalesRepository.createTransaction(client, transactionData);

      await client.query('COMMIT');
      return { ...saleRecord, items: processedItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}