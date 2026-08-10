"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosService = void 0;
const database_1 = require("../config/database");
const salesRepository_1 = require("../repositories/salesRepository");
const inventoryRepository_1 = require("../repositories/inventoryRepository");
class PosService {
    static async checkout(tenantId, cashierId, data) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            let subtotal = 0;
            let totalCost = 0;
            const processedItems = [];
            for (const itemInput of data.items) {
                const prodRes = await client.query('SELECT * FROM products WHERE tenant_id = $1 AND id = $2 AND archived_at IS NULL', [tenantId, itemInput.product_id]);
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
                await inventoryRepository_1.InventoryRepository.createLog(client, {
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
            const saleRecord = await salesRepository_1.SalesRepository.createTransaction(client, transactionData);
            await client.query('COMMIT');
            return { ...saleRecord, items: processedItems };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.PosService = PosService;
