---
name: Internal Wallet Payment Platform
overview: Build a production-ready fintech wallet platform with Java/Spring Boot backend, React ops dashboard, PostgreSQL for ledger-based accounting, Redis for concurrency control, and RabbitMQ for async operations. The system implements double-entry accounting, strong consistency, idempotency, and AI-powered operational insights.
todos:
  - id: setup-backend
    content: Initialize Spring Boot project with dependencies (PostgreSQL, Redis, RabbitMQ, OpenAI, JPA, Flyway), configure application properties, and set up project structure
    status: pending
  - id: database-schema
    content: Create Flyway migration scripts for all database tables (wallets, ledger_entries, transactions, alerts, etc.) with proper indexes and constraints
    status: pending
  - id: core-models
    content: Implement JPA entities for Wallet, LedgerEntry, Transaction, Alert with proper relationships and annotations
    status: pending
  - id: distributed-locking
    content: Implement DistributedLockManager using Redis for wallet-level concurrency control with TTL and retry logic
    status: pending
  - id: idempotency
    content: Implement IdempotencyManager using Redis to cache transaction results and prevent duplicate processing
    status: pending
  - id: ledger-service
    content: Implement LedgerService with double-entry accounting logic, creating DEBIT and CREDIT entries atomically
    status: pending
  - id: balance-calculator
    content: Implement BalanceCalculator utility that queries ledger entries to compute wallet balance with optimized queries
    status: pending
  - id: wallet-service
    content: Implement WalletService with CRUD operations, state management (CREATED→ACTIVE→SUSPENDED→CLOSED), and validation
    status: pending
  - id: payment-service
    content: "Implement PaymentService with full payment flow: idempotency check, lock acquisition, validation, ledger updates, atomic transaction handling"
    status: pending
  - id: payment-controller
    content: Create PaymentController REST API with request validation, error handling, and response DTOs
    status: pending
  - id: reconciliation-service
    content: Implement ReconciliationService with scheduled jobs to validate ledger consistency and detect mismatches
    status: pending
  - id: alert-service
    content: Implement AlertService with threshold monitoring, cooldown logic, and async email notifications via RabbitMQ
    status: pending
  - id: ai-summary-service
    content: Implement AISummaryService with daily batch jobs, OpenAI integration, and fallback for AI unavailability
    status: pending
  - id: async-listeners
    content: Create RabbitMQ listeners for email alerts and AI summary processing with error handling and retry logic
    status: pending
  - id: transaction-controller
    content: Create TransactionController with endpoints for querying transactions, ledger entries, and failure analysis
    status: pending
  - id: frontend-setup
    content: Initialize React TypeScript project, set up routing, API service layer, and component structure for ops dashboard
    status: pending
  - id: frontend-dashboard
    content: "Build React dashboard components: WalletList, TransactionList, FailureAnalysis, AlertConfig with real-time data fetching"
    status: pending
  - id: docker-compose
    content: Create docker-compose.yml with PostgreSQL, Redis, RabbitMQ services for local development
    status: pending
  - id: testing
    content: Write unit tests for services, integration tests for payment flow, and concurrency tests for distributed locking
    status: pending
  - id: documentation
    content: Create README with setup instructions, API documentation, and architecture overview
    status: pending
---

# Internal Wallet Payment & Ops Platform - Implementation Plan

## Tech Stack Recommendation

**Backend**: Java 17+ with Spring Boot 3.x

- Excellent ACID transaction support
- Mature ecosystem for financial systems
- Strong consistency guarantees
- Excellent performance (<200ms target achievable)

**Database**: PostgreSQL 14+

- ACID compliance for financial correctness
- Strong consistency
- JSON support for flexible metadata
- Excellent concurrency control

**Caching & Distributed Locking**: Redis 7+

- Distributed locks for wallet-level concurrency control
- Cache for frequently accessed wallet balances
- Pub/Sub for event notifications

**Message Queue**: RabbitMQ 3.12+

- Async email alerts
- Async AI processing
- Dead letter queues for retry logic

**Frontend**: React 18+ with TypeScript

- Ops/admin dashboard
- Real-time monitoring
- Transaction analytics

**AI Service**: OpenAI API (GPT-4)

**Email Service**: SMTP (JavaMail)

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Ops Dashboard & Monitoring)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│              Spring Boot Backend                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Payment  │  │ Wallet   │  │ Ledger   │              │
│  │ Service  │  │ Service  │  │ Service  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Reconcile│  │ Alert    │  │AI Summary│              │
│  │ Service │  │ Service  │  │ Service  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────┬────────────────┬───────────────────┬───────────────┘
     │                │                   │
     │                │                   │
┌────▼────┐    ┌──────▼──────┐    ┌──────▼──────┐
│PostgreSQL│    │   Redis     │    │  RabbitMQ   │
│          │    │             │    │             │
│ Ledger   │    │ Distributed │    │ Email Queue │
│ Wallets  │    │ Locks       │    │ AI Queue    │
│ Txns     │    │ Cache       │    │ Events      │
└──────────┘    └─────────────┘    └─────────────┘
```

### Data Flow: Payment Processing

```
Payment Request
    │
    ├─► Idempotency Check (Redis)
    │       │
    │       ├─► Already processed? → Return cached result
    │       └─► New? → Continue
    │
    ├─► Acquire Distributed Lock (Redis) on Sender Wallet
    │       │
    │       ├─► Lock acquired? → Continue
    │       └─► Lock failed? → Retry or fail
    │
    ├─► Begin Database Transaction
    │       │
    │       ├─► Validate Wallets (State, existence)
    │       ├─► Validate Balance (Query ledger)
    │       ├─► Create Transaction Record (INITIATED → PROCESSING)
    │       │
    │       ├─► Create Ledger Entry (DEBIT) - Atomic
    │       ├─► Create Ledger Entry (CREDIT) - Atomic
    │       │
    │       ├─► Update Transaction (SUCCESS)
    │       └─► Commit Transaction
    │
    ├─► Release Distributed Lock
    │
    ├─► Cache Idempotency Result (Redis)
    │
    └─► Publish Event (RabbitMQ) for async processing
            │
            ├─► Email Alerts (if threshold breached)
            └─► AI Analysis (daily batch)
```

## Database Schema

### Core Tables

**wallets**

- `wallet_id` (UUID, PK)
- `user_id` (UUID, indexed)
- `status` (ENUM: CREATED, ACTIVE, SUSPENDED, CLOSED)
- `created_at`, `updated_at`
- `metadata` (JSONB)

**ledger_entries** (Immutable)

- `entry_id` (UUID, PK)
- `wallet_id` (UUID, FK, indexed)
- `transaction_id` (UUID, FK, indexed)
- `entry_type` (ENUM: DEBIT, CREDIT)
- `amount` (DECIMAL(19,4))
- `balance_after` (DECIMAL(19,4)) - computed, denormalized for performance
- `created_at` (timestamp, indexed)
- `description` (TEXT)

**transactions**

- `transaction_id` (UUID, PK)
- `idempotency_key` (VARCHAR(255), UNIQUE, indexed)
- `sender_wallet_id` (UUID, FK)
- `receiver_wallet_id` (UUID, FK)
- `amount` (DECIMAL(19,4))
- `status` (ENUM: INITIATED, PROCESSING, SUCCESS, FAILED)
- `failure_code` (VARCHAR(50), nullable)
- `failure_reason` (TEXT, nullable)
- `created_at`, `updated_at`

**transaction_failures**

- `failure_id` (UUID, PK)
- `transaction_id` (UUID, FK)
- `failure_code` (VARCHAR(50))
- `category` (VARCHAR(50))
- `created_at`

**alerts**

- `alert_id` (UUID, PK)
- `alert_type` (VARCHAR(50))
- `severity` (ENUM: CRITICAL, WARNING, INFO)
- `status` (ENUM: PENDING, SENT, ACKNOWLEDGED)
- `recipients` (TEXT[]) - email addresses
- `message` (TEXT)
- `sent_at`, `created_at`

**alert_configurations**

- `config_id` (UUID, PK)
- `alert_type` (VARCHAR(50), UNIQUE)
- `threshold` (DECIMAL)
- `severity` (ENUM)
- `recipients` (TEXT[])
- `cooldown_minutes` (INT)
- `enabled` (BOOLEAN)

**ai_summaries**

- `summary_id` (UUID, PK)
- `summary_date` (DATE, indexed)
- `summary_type` (VARCHAR(50))
- `content` (TEXT)
- `created_at`

## Project Structure

```
Smart-Wallet/
├── backend/
│   ├── src/main/java/com/smartwallet/
│   │   ├── SmartWalletApplication.java
│   │   ├── config/
│   │   │   ├── RedisConfig.java
│   │   │   ├── RabbitMQConfig.java
│   │   │   ├── OpenAIConfig.java
│   │   │   └── LockConfig.java
│   │   ├── controller/
│   │   │   ├── WalletController.java
│   │   │   ├── PaymentController.java
│   │   │   ├── TransactionController.java
│   │   │   └── AlertController.java
│   │   ├── service/
│   │   │   ├── WalletService.java
│   │   │   ├── PaymentService.java
│   │   │   ├── LedgerService.java
│   │   │   ├── ReconciliationService.java
│   │   │   ├── AlertService.java
│   │   │   └── AISummaryService.java
│   │   ├── repository/
│   │   │   ├── WalletRepository.java
│   │   │   ├── LedgerEntryRepository.java
│   │   │   ├── TransactionRepository.java
│   │   │   └── AlertRepository.java
│   │   ├── model/
│   │   │   ├── Wallet.java
│   │   │   ├── LedgerEntry.java
│   │   │   ├── Transaction.java
│   │   │   └── PaymentRequest.java
│   │   ├── exception/
│   │   │   ├── InsufficientBalanceException.java
│   │   │   ├── InvalidWalletStateException.java
│   │   │   └── DuplicateTransactionException.java
│   │   ├── util/
│   │   │   ├── DistributedLockManager.java
│   │   │   ├── IdempotencyManager.java
│   │   │   └── BalanceCalculator.java
│   │   └── listener/
│   │       ├── EmailAlertListener.java
│   │       └── AISummaryListener.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   │       └── V1__Initial_schema.sql
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── WalletList.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── FailureAnalysis.tsx
│   │   │   └── AlertConfig.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── docker/
    ├── docker-compose.yml
    └── Dockerfile.backend
```

## Key Implementation Details

### 1. Distributed Locking Strategy

**Implementation**: Redis-based distributed locks with wallet-level granularity

- Lock key: `wallet:lock:{wallet_id}`
- TTL: 10 seconds (auto-release on crash)
- Retry logic with exponential backoff
- Prevents concurrent modifications to same wallet

**File**: `backend/src/main/java/com/smartwallet/util/DistributedLockManager.java`

### 2. Idempotency Implementation

**Implementation**: Redis cache with transaction result

- Key: `idempotency:{idempotency_key}`
- TTL: 24 hours
- Stores: Transaction ID and status
- Prevents duplicate processing

**File**: `backend/src/main/java/com/smartwallet/util/IdempotencyManager.java`

### 3. Double-Entry Accounting

**Implementation**: Two ledger entries created atomically within same DB transaction

- DEBIT entry: Decreases sender balance
- CREDIT entry: Increases receiver balance
- Atomicity guaranteed by DB transaction
- Balance calculated by summing ledger entries (query optimization with indexes)

**File**: `backend/src/main/java/com/smartwallet/service/LedgerService.java`

### 4. Balance Calculation

**Implementation**:

- Real-time: `SELECT SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE -amount END) FROM ledger_entries WHERE wallet_id=?`
- Cached: Redis cache (optional, eventually consistent)
- Index on `(wallet_id, created_at)` for performance

**File**: `backend/src/main/java/com/smartwallet/util/BalanceCalculator.java`

### 5. Payment Processing Flow

**File**: `backend/src/main/java/com/smartwallet/service/PaymentService.java`

Key steps:

1. Validate idempotency key (Redis check)
2. Acquire distributed lock on sender wallet
3. Begin DB transaction
4. Validate wallets (state, existence)
5. Calculate sender balance from ledger
6. Validate sufficient balance
7. Create transaction record (PROCESSING)
8. Create DEBIT ledger entry
9. Create CREDIT ledger entry
10. Update transaction (SUCCESS)
11. Commit transaction
12. Release lock
13. Cache idempotency result
14. Publish event for async processing

### 6. Alert System

**File**: `backend/src/main/java/com/smartwallet/service/AlertService.java`

Triggers:

- High failure rate (threshold configurable)
- Ledger inconsistencies (reconciliation mismatch)
- Repeated duplicate transactions
- System errors

Implementation:

- Scheduled job checks metrics every 5 minutes
- Cooldown period prevents spam
- Email sent via SMTP (async via RabbitMQ)
- Alert history stored in database

### 7. AI Summary Service

**File**: `backend/src/main/java/com/smartwallet/service/AISummaryService.java`

Implementation:

- Daily batch job at 00:00 UTC
- Collects failure data and transaction stats
- Calls OpenAI API (non-blocking, async via RabbitMQ)
- Stores summary in database
- Fallback if AI unavailable: Basic text summary

### 8. Reconciliation Service

**File**: `backend/src/main/java/com/smartwallet/service/ReconciliationService.java`

Implementation:

- Scheduled job runs every hour
- Validates: `SUM(ledger_entries.amount) == transaction.amount` for each transaction
- Flags mismatches for investigation
- Generates reconciliation report

## API Endpoints

### Wallet Management

- `POST /api/wallets` - Create wallet
- `GET /api/wallets/{id}` - Get wallet details
- `GET /api/wallets/{id}/balance` - Get balance
- `PATCH /api/wallets/{id}/status` - Update status

### Payments

- `POST /api/payments` - Initiate payment (requires idempotency_key)
- `GET /api/payments/{id}` - Get payment status

### Transactions

- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/{id}` - Get transaction details
- `GET /api/transactions/{id}/ledger` - Get ledger entries

### Operations

- `GET /api/reconciliation/report` - Reconciliation report
- `GET /api/failures/analysis` - Failure analysis
- `GET /api/alerts` - List alerts
- `POST /api/alerts/config` - Configure alerts
- `GET /api/ai/summaries` - AI summaries

## Concurrency Safety

1. **Database-level**: Row-level locks via `SELECT FOR UPDATE` on wallet rows
2. **Application-level**: Redis distributed locks (redundant safety)
3. **Optimistic locking**: Version fields on wallet entity (additional safety)
4. **Isolation level**: `READ_COMMITTED` (default) for strong consistency

## Performance Optimizations

1. **Indexes**: 

   - `wallet_id` on ledger_entries
   - `transaction_id` on ledger_entries
   - `idempotency_key` on transactions (UNIQUE)
   - Composite index on `(wallet_id, created_at)` for balance queries

2. **Caching**:

   - Wallet balances cached in Redis (TTL: 60s)
   - Cache invalidation on balance changes

3. **Connection Pooling**: HikariCP for PostgreSQL

4. **Async Processing**: RabbitMQ for non-critical operations (emails, AI)

## Testing Strategy

1. **Unit Tests**: Service layer, utility classes
2. **Integration Tests**: Payment flow, ledger consistency
3. **Concurrency Tests**: Multiple simultaneous payments on same wallet
4. **Idempotency Tests**: Duplicate request handling
5. **Failure Tests**: Insufficient balance, invalid states

## Deployment Considerations

1. **Docker Compose**: Local development with PostgreSQL, Redis, RabbitMQ
2. **Environment Variables**: Database credentials, Redis, RabbitMQ, OpenAI API key
3. **Health Checks**: Actuator endpoints for monitoring
4. **Logging**: Structured logging (JSON format) for observability
5. **Metrics**: Micrometer + Prometheus for monitoring

## Security

1. **API Authentication**: JWT tokens (internal ops team only)
2. **Input Validation**: Bean validation on all DTOs
3. **SQL Injection**: Prepared statements via JPA
4. **Rate Limiting**: Redis-based rate limiting on API endpoints

## Migration Strategy

1. Database migrations via Flyway
2. Versioned schema changes
3. Zero-downtime deployments (rolling updates)

This plan provides a production-ready architecture that meets all requirements while maintaining financial correctness, operational reliability, and observability.