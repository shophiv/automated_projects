-- Phase 2: Product & Category Management Schema

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    brand VARCHAR(100),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50) DEFAULT 'pcs',
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    max_stock INTEGER NOT NULL DEFAULT 100,
    image_url TEXT,
    description TEXT,
    active_status BOOLEAN DEFAULT TRUE,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_name ON products(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(tenant_id, barcode);