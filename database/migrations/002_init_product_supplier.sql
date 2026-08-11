CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    retailer_id INT REFERENCES retailers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    retailer_id INT REFERENCES retailers(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    retailer_id INT REFERENCES retailers(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    brand VARCHAR(100),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    profit_margin NUMERIC(5, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    unit VARCHAR(50) DEFAULT 'pcs',
    quantity INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 5,
    max_stock INT DEFAULT 1000,
    image_url TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_retailer_sku UNIQUE(retailer_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_categories_retailer_id ON categories(retailer_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_retailer_id ON suppliers(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_retailer_id ON products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);