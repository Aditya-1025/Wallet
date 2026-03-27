# Database Audit & Query Guide

This guide helps you verify the wallet data directly in the database to ensure the "Spent this month" logic is working correctly.

## 🛠 How to access the Database (Adminer)

The project includes **Adminer**, a web-based database management tool. It is already running as part of your Docker setup.

1. **Open your browser** to: `http://localhost:8080`
2. **Login with these details**:
   - **System**: `PostgreSQL`
   - **Server**: `postgres` (or `localhost` if connecting from outside Docker)
   - **Username**: `postgres`
   - **Password**: `postgres`
   - **Database**: `smart_wallet_db`

---

## 🔍 Useful Diagnostic Queries

### 1. Check your Wallet Counters
Run this to see your actual balance and total sent/received amounts.
```sql
SELECT 
    user_id, 
    balance, 
    total_received, 
    total_sent 
FROM wallet 
WHERE user_id = 'YOUR_USER_ID';
```
*(Note: If `total_sent` is 0 here, then no successful OUTGOING transfers have been recorded for this user.)*

### 2. Verify "Spent" (Total Sent) Manually
Run this to sum up all successful transfers you have made. This should match the `total_sent` in the wallet table.
```sql
SELECT SUM(amount) 
FROM transactions 
WHERE user_id = 'YOUR_USER_ID' 
  AND type = 'TRANSFER' 
  AND status = 'SUCCESS';
```

### 3. Check Recent Transactions
See the full log of what happened to your wallet.
```sql
SELECT * FROM transactions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

---

## ❓ Why is "Spent this month" 0?

In your recent screenshot, the transaction was **"Received from ..."**. 
- **Incoming Money** (Deposits/Received Transfers) updates `total_received`.
- **Outgoing Money** (Sent Transfers) updates `total_sent` (Spent).

If you have only **received** money but haven't **sent** any yet, the "Spent" value will correctly show **0**. Try sending a small amount to another user, and you will see the "Spent" total update immediately!
