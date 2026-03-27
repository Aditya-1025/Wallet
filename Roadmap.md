📘 Project Execution Roadmap
Internal Wallet Payment & Ops Platform
1. Purpose

This document defines the recommended execution order for building the Internal Wallet Payment & Ops Platform.
The goal is to ensure financial correctness, strong consistency, and production-grade architecture by building the system in logically safe phases.

The execution order is intentionally strict to avoid rework and ensure correctness.

2. Guiding Principles

Ledger correctness is the highest priority

Core financial logic must be built before infrastructure

Asynchronous systems must never block payments

AI features must be non-blocking and optional

Each phase must be complete and validated before proceeding

3. Where to Start (Decision Rationale)

The project must start with the database schema and core domain models, not with Redis, RabbitMQ, AI, or frontend components.

In financial systems:

The ledger is the source of truth.
All other systems depend on it.

If ledger logic is incorrect, all downstream features become invalid.

4. Phase-Wise Execution Plan
   Phase 1 — Foundation (Days 1–2)

Objective:
Establish a stable backend and database foundation.

Tasks:

Initialize Spring Boot backend project

Configure PostgreSQL connectivity

Enable Flyway migrations

Verify application startup and DB connection

Deliverables:

Running Spring Boot application

PostgreSQL connected successfully

Flyway migration execution confirmed

Notes:

No business logic is implemented in this phase

Phase 2 — Database Schema & Core Models (Days 2–3)

Objective:
Lock the financial data model.

Tasks:

Create Flyway migrations for:

wallets

ledger_entries

transactions

Define primary keys, foreign keys, indexes, and constraints

Implement JPA entities for Wallet, LedgerEntry, and Transaction

Define enums for wallet states and transaction states

Deliverables:

Stable database schema

JPA entities mapped correctly

Notes:

Schema changes after this phase should be avoided

Phase 3 — Ledger Engine (Day 3)

Objective:
Implement double-entry accounting.

Tasks:

Implement LedgerService

Create atomic DEBIT and CREDIT entries

Ensure immutability of ledger entries

Implement balance calculation logic

Deliverables:

Correct ledger posting

Accurate balance derivation

Validation:

Manual DB verification of ledger entries

Debit and credit entries always created together

Phase 4 — Wallet Management (Day 4)

Objective:
Manage wallet lifecycle and validation.

Tasks:

Implement WalletService

Wallet state transitions:

CREATED → ACTIVE → SUSPENDED → CLOSED


Enforce wallet state validation rules

Expose wallet query APIs

Deliverables:

Wallet lifecycle fully functional

Payments allowed only for ACTIVE wallets

Phase 5 — Payment Processing (Basic Flow) (Day 5)

Objective:
Implement core payment logic without concurrency controls.

Tasks:

Implement PaymentService

Validate wallets and balance

Create transaction record

Perform ledger updates atomically

Deliverables:

Successful wallet-to-wallet transfers

Correct balance updates

Notes:

Redis and locking are intentionally excluded in this phase

Phase 6 — Idempotency (Day 6)

Objective:
Prevent duplicate transaction processing.

Tasks:

Integrate Redis

Implement IdempotencyManager

Cache transaction results using idempotency keys

Deliverables:

Duplicate requests return the same response

No double debit occurs

Phase 7 — Concurrency Control (Day 7)

Objective:
Prevent double spending under concurrent requests.

Tasks:

Implement distributed locking using Redis

Optionally add DB-level SELECT FOR UPDATE

Serialize payments per wallet

Deliverables:

Concurrency-safe payment processing

Strong consistency guarantees

Phase 8 — Reconciliation & Failure Analysis (Day 8)

Objective:
Ensure system correctness over time.

Tasks:

Implement ReconciliationService

Detect ledger and transaction mismatches

Generate reconciliation reports

Deliverables:

Automated consistency validation

Reconciliation insights

Phase 9 — Alerting & Notifications (Day 9)

Objective:
Enable operational awareness.

Tasks:

Implement AlertService

Configure threshold-based alerts

Integrate RabbitMQ for async processing

Send email notifications

Deliverables:

Non-blocking alerting system

Ops-ready notifications

Phase 10 — AI-Assisted Insights (Days 10–11)

Objective:
Improve operational understanding.

Tasks:

Implement AI summary generation

Schedule daily batch jobs

Add fallback logic when AI is unavailable

Deliverables:

AI-generated summaries for ops teams

No impact on core payment flows

Phase 11 — Frontend Ops Dashboard (Optional) (Days 12–14)

Objective:
Provide operational visibility.

Tasks:

Build React ops dashboard

Display wallets, transactions, failures, alerts

Connect frontend to backend APIs

Deliverables:

Ops dashboard for monitoring and analysis

5. Execution Timeline Summary
   Phase	Duration
   Foundation	Day 1
   Schema & Models	Day 2
   Ledger Engine	Day 3
   Wallet Service	Day 4
   Payment Service	Day 5
   Idempotency	Day 6
   Locking	Day 7
   Reconciliation	Day 8
   Alerts	Day 9
   AI	Day 10–11
   Frontend	Day 12+

Total Estimated Duration: ~2–3 weeks

6. Execution Rules (Mandatory)

One phase must be stable before starting the next

Ledger correctness takes precedence over all features

AI must never block payment processing

Async systems must be non-blocking

Every phase must be tested and documented

7. Definition of Done

The project is considered complete when:

Wallet balances are always correct

Concurrent payments are safe

Duplicate requests are handled correctly

Ledger and transactions reconcile successfully

Alerts are actionable and non-spammy

AI features add value without risk

8. Final Note

This roadmap is designed to mirror real fintech system development.
Following this execution order ensures a clean, scalable, and interview-ready backend platform.

End of Document