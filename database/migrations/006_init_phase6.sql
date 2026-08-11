CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_retailer_id ON notifications(retailer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(retailer_id, is_read);

CREATE TABLE IF NOT EXISTS retailer_settings (
    id SERIAL PRIMARY KEY,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    UNIQUE(retailer_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_retailer_settings_retailer_id ON retailer_settings(retailer_id);