-- Migration 004: Point of Sale & Sales Management Schema

CREATE TABLE IF NOT EXISTS sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    profit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, credit_card, debit_card, bank_transfer, digital_wallet, split
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- completed, refunded, cancelled
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales_transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_sales_tenant_invoice ON sales_transactions(tenant_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_date ON sales_transactions(tenant_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);