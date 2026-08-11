-- Phase 5 Migration: Expenses, Accounts, Journal Entries, Indexes

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    expense_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(retailer_id, account_code)
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    reference_id VARCHAR(100),
    description TEXT NOT NULL,
    debit_account_id INT NOT NULL REFERENCES accounts(id),
    credit_account_id INT NOT NULL REFERENCES accounts(id),
    amount NUMERIC(12, 2) NOT NULL,
    entry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_retailer_created ON sales(retailer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_retailer_date ON expenses(retailer_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_journal_retailer_date ON journal_entries(retailer_id, entry_date);