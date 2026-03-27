📘 Datastore Strategy
MongoDB for Onboarding | PostgreSQL for Financial Systems
1. Overview

This document defines the dual-database strategy for the Internal Wallet Payment Platform.

MongoDB is used for user onboarding and KYC-related data

PostgreSQL is used for wallets, ledger, transactions, and financial records

This separation is intentional, required, and frozen.

2. Design Rationale (WHY SPLIT DATABASES)

Fintech systems have two very different data characteristics:

Aspect	Onboarding Data	Financial Data
Schema	Flexible	Strict
Mutability	Frequently updated	Immutable
Consistency	Eventual acceptable	Strong ACID required
Structure	Nested / evolving	Relational
Audit Criticality	Medium	Very High

➡️ Using one database for both is a bad practice.

3. MongoDB – Onboarding & KYC Domain
   3.1 Why MongoDB for Onboarding?

MongoDB is ideal because:

Onboarding flows change frequently

Fields evolve (new KYC docs, new checks)

Nested data fits naturally

No financial consistency requirements

3.2 What Goes into MongoDB (STRICT)

MongoDB will store:

User profile

Onboarding state

Device binding

Email/password setup metadata

PAN details

KYC step history

MongoDB will NOT store:

Wallet balances

Ledger entries

Transactions

Payment status

3.3 MongoDB Collection: user_onboarding
{
"_id": "userId",
"email": "user@email.com",
"passwordHash": "hashed_value",
"onboardingState": "PAN_SUBMITTED",
"device": {
"deviceId": "device123",
"fingerprint": "fp_abc",
"boundAt": "2026-01-01T10:00:00Z"
},
"pan": {
"panNumber": "ABCDE1234F",
"status": "SUBMITTED",
"submittedAt": "2026-01-01T10:05:00Z"
},
"audit": [
{
"step": "DEVICE_BOUND",
"timestamp": "2026-01-01T10:01:00Z"
},
{
"step": "PAN_SUBMITTED",
"timestamp": "2026-01-01T10:05:00Z"
}
],
"createdAt": "2026-01-01T09:55:00Z",
"updatedAt": "2026-01-01T10:05:00Z"
}

3.4 MongoDB Onboarding States (Frozen)
CREATED
→ DEVICE_BOUND
→ CREDENTIALS_SET
→ PAN_SUBMITTED
→ VERIFIED


MongoDB is the source of truth for onboarding status.

4. PostgreSQL – Wallet & Financial Domain
   4.1 Why PostgreSQL for Financial Data?

Financial systems require:

ACID transactions

Strong consistency

Referential integrity

Rollbacks

Immutable audit trails

PostgreSQL is non-negotiable here.

4.2 What Goes into PostgreSQL (STRICT)

PostgreSQL will store:

Wallets

Ledger entries

Transactions

Reconciliation data

Alerts

AI summaries

PostgreSQL will NOT store:

KYC documents

Onboarding steps

Device fingerprints

4.3 PostgreSQL Wallet Table (Example)
wallets
- wallet_id (UUID, PK)
- user_id (UUID, indexed)
- status (CREATED / ACTIVE / SUSPENDED)
- created_at

4.4 Wallet Activation Rule

PostgreSQL wallet state is derived from MongoDB onboarding state.

IF onboardingState == VERIFIED
THEN wallet.status = ACTIVE
ELSE wallet.status = CREATED

5. Cross-Database Interaction Rules (VERY IMPORTANT)
   Rule 1: MongoDB → PostgreSQL is One-Way

Onboarding completion in MongoDB can activate wallet

Wallet changes never modify onboarding data

Rule 2: No Distributed Transactions

No Mongo + Postgres transaction spanning

Systems communicate via:

API calls

Events

Asynchronous updates

Rule 3: Payment Flow Dependency

Before any payment:

Fetch onboarding state from MongoDB
IF state != VERIFIED → Reject payment


MongoDB is read-only during payment processing.

6. End-to-End Flow (Combined)
   User Onboarding (MongoDB)
   ↓
   Onboarding State = VERIFIED
   ↓
   Wallet Activated (PostgreSQL)
   ↓
   Payments Allowed

7. Failure Scenarios & Handling
   Scenario	Handling
   MongoDB down	Block new payments
   Wallet DB down	Payments unavailable
   Onboarding incomplete	Wallet inactive
   Data mismatch	Alert ops team
8. Audit & Compliance

MongoDB maintains onboarding audit trail

PostgreSQL maintains financial audit trail

Clear separation improves compliance reviews

9. Benefits of This Architecture

Scalable onboarding changes

Strong financial correctness

Reduced blast radius

Easier audits

Real fintech architecture

10. How to Explain This in Interviews

“We separated onboarding and financial domains using MongoDB for flexible KYC workflows and PostgreSQL for strongly consistent financial data, avoiding distributed transactions and ensuring auditability.”

This sounds very senior.

11. Next Implementation Steps

Configure MongoDB connection

Create user_onboarding schema & indexes

Implement OnboardingService

Integrate onboarding check into PaymentService

12. Requirement Freeze Statement

MongoDB is the source of truth for onboarding and KYC.
PostgreSQL is the source of truth for wallets and financial data.
This separation is final and must not be violated.

End of Document