CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    max_users INT NOT NULL,
    max_products INT NOT NULL,
    storage_limit BIGINT NOT NULL, -- in bytes
    features_json TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_retailer_id INT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add subscription_id and storage_used to retailers if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='retailers' and column_name='subscription_id') THEN
        ALTER TABLE retailers ADD COLUMN subscription_id INT REFERENCES subscriptions(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='retailers' and column_name='storage_used') THEN
        ALTER TABLE retailers ADD COLUMN storage_used BIGINT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='retailers' and column_name='status') THEN
        ALTER TABLE retailers ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
    END IF;
END $$;

-- Seed default subscriptions if empty
INSERT INTO subscriptions (name, max_users, max_products, storage_limit, features_json, price)
SELECT 'Free', 2, 100, 52428800, '{"reports": false, "predictions": false, "barcode": true}', 0.00
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE name = 'Free');

INSERT INTO subscriptions (name, max_users, max_products, storage_limit, features_json, price)
SELECT 'Basic', 5, 5000, 536870912, '{"reports": true, "predictions": false, "barcode": true}', 29.99
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE name = 'Basic');

INSERT INTO subscriptions (name, max_users, max_products, storage_limit, features_json, price)
SELECT 'Professional', 15, 25000, 5368709120, '{"reports": true, "predictions": true, "barcode": true}', 79.99
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE name = 'Professional');

INSERT INTO subscriptions (name, max_users, max_products, storage_limit, features_json, price)
SELECT 'Enterprise', 100, 100000, 53687091200, '{"reports": true, "predictions": true, "barcode": true}', 199.99
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE name = 'Enterprise');