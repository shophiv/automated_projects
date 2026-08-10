-- Phase 6: Accounting Entries Table Schema

CREATE TABLE IF NOT EXISTS accounting_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'journal')),
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    reference_id UUID,
    description TEXT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounting_entries_tenant_date ON accounting_entries (tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_tenant_type ON accounting_entries (tenant_id, type);