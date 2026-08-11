import { POSRepository } from './pos.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { transactionManager } from '../../config/database';

export class POSService {
  private posRepository = new POSRepository();
  private inventoryRepository = new InventoryRepository();

  // In-memory store for held sales per retailer
  private heldSales: Map<number, Array<{ id: string; cart: any; timestamp: string }>> = new Map();

  async lookupByBarcode(retailerId: number, barcode: string) {
    if (!barcode) {
      throw new Error('Barcode is required');
    }
    const product = await this.posRepository.findProductByBarcode(retailerId, barcode);
    if (!product) {
      throw new Error('Product not found with barcode: ' + barcode);
    }
    return product;
  }

  async processSale(retailerId: number, cashierId: number, saleData: {
    customerName?: string;
    paymentMethod: string;
    items: Array<{ productId: number; quantity: number }>;
    discountAmount?: number;
    taxAmount?: number;
  }) {
    if (!saleData.items || saleData.items.length === 0) {
      throw new Error('Cart is empty');
    }

    if (!saleData.paymentMethod) {
      throw new Error('Payment method is required');
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await transactionManager.runInTransaction(async (client) => {
      let totalAmount = 0;
      let totalProfit = 0;
      const processedItems = [];

      for (const cartItem of saleData.items) {
        // Fetch product details with lock
        const productQuery = `
          SELECT id, name, purchase_price, selling_price, quantity
          FROM products
          WHERE id = $1 AND retailer_id = $2 AND status = 'active'
          FOR UPDATE
        `;
        const prodRes = await client.query(productQuery, [cartItem.productId, retailerId]);
        if (prodRes.rows.length === 0) {
          throw new Error(`Product with ID ${cartItem.productId} not found or inactive`);
        }

        const product = prodRes.rows[0];
        if (product.quantity < cartItem.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${cartItem.quantity}`);
        }

        const unitPrice = Number(product.selling_price);
        const costPrice = Number(product.purchase_price);
        const itemTotal = unitPrice * cartItem.quantity;
        const itemProfit = (unitPrice - costPrice) * cartItem.quantity;

        totalAmount += itemTotal;
        totalProfit += itemProfit;

        processedItems.push({
          productId: product.id,
          quantity: cartItem.quantity,
          unitPrice,
          totalPrice: itemTotal,
          costPrice,
          profit: itemProfit
        });

        // Deduct inventory
        await this.inventoryRepository.updateStockAndLog(
          retailerId,
          product.id,
          -Math.abs(cartItem.quantity),
          'SALE_DEDUCTION',
          invoiceNumber,
          client
        );
      }

      const taxAmount = saleData.taxAmount || 0;
      const discountAmount = saleData.discountAmount || 0;
      const finalTotal = totalAmount + taxAmount - discountAmount;
      const finalProfit = totalProfit - discountAmount; // discounts reduce profit

      const sale = await this.posRepository.createSale(
        retailerId,
        cashierId,
        invoiceNumber,
        saleData.customerName,
        finalTotal,
        taxAmount,
        discountAmount,
        finalProfit,
        saleData.paymentMethod,
        processedItems,
        client
      );

      return sale;
    });
  }

  holdSale(retailerId: number, cartData: any) {
    const holdId = `HOLD-${Date.now()}`;
    const retailerHolds = this.heldSales.get(retailerId) || [];
    const holdEntry = { id: holdId, cart: cartData, timestamp: new Date().toISOString() };
    retailerHolds.push(holdEntry);
    this.heldSales.set(retailerId, retailerHolds);
    return holdEntry;
  }

  getHeldSales(retailerId: number) {
    return this.heldSales.get(retailerId) || [];
  }

  resumeSale(retailerId: number, holdId: string) {
    const retailerHolds = this.heldSales.get(retailerId) || [];
    const index = retailerHolds.findIndex(h => h.id === holdId);
    if (index === -1) {
      throw new Error('Held sale not found');
    }
    const [held] = retailerHolds.splice(index, 1);
    this.heldSales.set(retailerId, retailerHolds);
    return held;
  }

  deleteHeldSale(retailerId: number, holdId: string) {
    const retailerHolds = this.heldSales.get(retailerId) || [];
    const index = retailerHolds.findIndex(h => h.id === holdId);
    if (index === -1) {
      throw new Error('Held sale not found');
    }
    retailerHolds.splice(index, 1);
    this.heldSales.set(retailerId, retailerHolds);
    return { success: true };
  }
}