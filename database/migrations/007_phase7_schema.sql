-- Phase 7 Database Schema Migration: Platform Admins, Subscriptions, Notifications, and System Logs

CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    max_users INT NOT NULL DEFAULT 5,
    max_products INT NOT NULL DEFAULT 1000,
    storage_limit BIGINT NOT NULL DEFAULT 1073741824, -- 1GB in bytes
    features_json JSONB DEFAULT '{}'::jsonb,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription tiers if not present
INSERT INTO subscriptions (name, max_users, max_products, storage_limit, features_json, price)
VALUES 
('Free', 2, 100, 536870912, '{"reports": false, "predictions": false, "barcode_printing": false, "support_level": "community"}'::jsonb, 0.00),
('Basic', 5, 2500, 2147483648, '{"reports": true, "predictions": false, "barcode_printing": true, "support_level": "standard"}'::jsonb, 29.99),
('Professional', 15, 25000, 10737418240, '{"reports": true, "predictions": true, "barcode_printing": true, "support_level": "priority"}'::jsonb, 79.99),
('Enterprise', 999, 100000, 53687091200, '{"reports": true, "predictions": true, "barcode_printing": true, "support_level": "dedicated"}'::jsonb, 199.99)
ON CONFLICT (name) DO NOTHING;

-- Update tenants table with subscription and storage usage if columns do not exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' and column_name='subscription_id') THEN
        ALTER TABLE tenants ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' and column_name='storage_used') THEN
        ALTER TABLE tenants ADD COLUMN storage_used BIGINT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' and column_name='settings_json') THEN
        ALTER TABLE tenants ADD COLUMN settings_json JSONB DEFAULT '{"currency": "USD", "tax_rate": 0.0, "receipt_header": "Smart Retail Store", "receipt_footer": "Thank you for your business!"}'::jsonb;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity VARCHAR(20) DEFAULT 'error',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES platform_admins(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_tenant ON system_error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription ON tenants(subscription_id);