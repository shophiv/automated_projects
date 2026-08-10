import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../../services/apiClient';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  selling_price: number;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export const PosPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'split'>('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0.05);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get(`/products?search=${encodeURIComponent(search)}&limit=20`);
      setProducts(res.data.data);
    } catch (err: any) {
      console.error('Failed to load products', err);
    }
  };

  const handleScanBarcode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const barcode = barcodeInputRef.current?.value.trim();
    if (!barcode) return;

    try {
      const res = await apiClient.get(`/inventory/barcode/lookup?barcode=${encodeURIComponent(barcode)}`);
      const product: Product = res.data.data;
      addToCart(product);
      if (barcodeInputRef.current) barcodeInputRef.current.value = '';
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Product not found for barcode');
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) {
          alert('Cannot add more than available stock');
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      if (product.quantity <= 0) {
        alert('Product is out of stock');
        return prev;
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cartQuantity: qty } : item))
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.selling_price * item.cartQuantity, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const calculatedTax = taxableAmount * taxRate;
  const grandTotal = taxableAmount + calculatedTax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        items: cart.map((item) => ({ product_id: item.id, quantity: item.cartQuantity })),
        customer_name: customerName,
        payment_method: paymentMethod,
        discount_amount: discountAmount,
        tax_rate: taxRate,
      };

      const res = await apiClient.post('/pos/checkout', payload);
      setSuccessReceipt(res.data.data);
      setCart([]);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Column: Products & Barcode */}
      <div className="w-2/3 flex flex-col p-4 border-r border-gray-200">
        <div className="mb-4 flex gap-4">
          <form onSubmit={handleScanBarcode} className="flex-1">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode or Enter SKU..."
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </form>
          <input
            type="text"
            placeholder="Search Products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => addToCart(prod)}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-semibold text-gray-800">{prod.name}</h4>
                <p className="text-sm text-gray-500">SKU: {prod.sku}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-blue-600">${Number(prod.selling_price).toFixed(2)}</span>
                <span className={`text-xs px-2 py-1 rounded ${prod.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Stock: {prod.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Cart & Checkout */}
      <div className="w-1/3 flex flex-col bg-white p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Current Sale</h2>

        <div className="mb-2">
          <label className="text-xs text-gray-600">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-1 border rounded text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto border-t border-b py-2 my-2 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">${Number(item.selling_price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                    className="px-2 bg-gray-200 rounded text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold">{item.cartQuantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                    className="px-2 bg-gray-200 rounded text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations */}
        <div className="space-y-1 text-sm py-2 border-b">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Discount ($)</span>
            <input
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 border rounded text-right text-sm"
            />
          </div>
          <div className="flex justify-between">
            <span>Tax (5%)</span>
            <span>${calculatedTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="my-2">
          <label className="text-xs text-gray-600">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e: any) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-1 border rounded text-sm"
          >
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="digital_wallet">Digital Wallet</option>
            <option value="split">Split Payment</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Processing...' : `Complete Checkout ($${grandTotal.toFixed(2)})`}
        </button>

        {successReceipt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs">
            <p className="font-bold text-green-800">Transaction Successful!</p>
            <p>Invoice: {successReceipt.invoice_number}</p>
            <p>Total: ${successReceipt.total_amount}</p>
            <button
              onClick={() => setSuccessReceipt(null)}
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs"
            >
              New Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
};