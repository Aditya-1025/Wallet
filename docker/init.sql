-- Schema initialization for Smart Wallet (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    pan_number VARCHAR(10),
    vkyc_status VARCHAR(50) DEFAULT 'PENDING',
    onboarding_step INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Table
CREATE TABLE IF NOT EXISTS wallet (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(19, 2) DEFAULT 0.00,
    total_received DECIMAL(19, 2) DEFAULT 0.00,
    total_sent DECIMAL(19, 2) DEFAULT 0.00,
    total_deposit DECIMAL(19, 2) DEFAULT 0.00,
    total_withdrawal DECIMAL(19, 2) DEFAULT 0.00,
    transaction_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    receiver_user_id VARCHAR(255),
    amount DECIMAL(19, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trans_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);

-- Sample Diagnostic Queries (How to check Spend/Total Sent)
-- 1. Check a specific user's wallet metrics:
-- SELECT balance, total_sent, total_received FROM wallet WHERE user_id = 'USER_ID_HERE';

-- 2. List all successful outgoing transfers for a user:
-- SELECT * FROM transactions WHERE user_id = 'SENDER_ID' AND type = 'TRANSFER' AND status = 'SUCCESS';

-- 3. Sum of all successful transfers (manual verification of total_sent):
-- SELECT SUM(amount) FROM transactions WHERE user_id = 'SENDER_ID' AND type = 'TRANSFER' AND status = 'SUCCESS';
