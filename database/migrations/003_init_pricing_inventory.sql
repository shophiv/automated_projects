-- Migration for Phase 3: Pricing and Inventory Management

-- Create inventory_logs table for audit trail of stock movements
CREATE TABLE IF NOT EXISTS inventory_logs (
    id SERIAL PRIMARY KEY,
    retailer_id INTEGER NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER', 'SALE'
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for high performance inventory log lookups by retailer and product
CREATE INDEX IF NOT EXISTS idx_inventory_logs_retailer_product ON inventory_logs(retailer_id, product_id);

-- Create retailer_settings table for storing margins, configuration, and preferences
CREATE TABLE IF NOT EXISTS retailer_settings (
    id SERIAL PRIMARY KEY,
    retailer_id INTEGER NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_retailer_setting UNIQUE (retailer_id, setting_key)
);

-- Add full-text search indexes on products for sub-300ms search performance
CREATE INDEX IF NOT EXISTS idx_products_search_fts ON products USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(barcode, '')));
CREATE INDEX IF NOT EXISTS idx_products_retailer_sku_barcode ON products(retailer_id, sku, barcode);