# Smart Wallet Application

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/import?repo=https://github.com/Aditya-1025/Smart-Wallet_)

A modern, secure digital wallet platform with sequential onboarding (PAN, VKYC) and real-time payment features.

## Prerequisites

- **Java 17**: Ensure `java -version` shows version 17 (standard for this deployment).
- **Node.js & npm**: For the Vite-based frontend.
- **Docker & Docker Compose**: To run PostgreSQL, MongoDB, and Redis.

## Getting Started

### 1. Start Infrastructure

Run the following command to start the required databases (PostgreSQL, MongoDB, Redis):

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Build the Project

From the root directory, run:

```bash
./mvnw clean install
```

*(Note: If you don't have Maven installed, use the included `./mvnw` wrapper)*

### 3. Run the Backend

Navigate to the `backend` directory and start the Spring Boot application:

```bash
cd backend
../mvnw spring-boot:run
```

The backend will be available at `http://localhost:8081`.

### 4. Run the Frontend

Navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Features

- **Onboarding**: Sequential PAN and VKYC verification flow.
- **Wallet**: Real-time balance management with pessimistic locking.
- **P2P Payments**: Scan & Pay via QR codes.
- **Admin Portal**: VKYC review and approval dashboard.

## Tech Stack

- **Backend**: Spring Boot 3.2, Java 17, JPA/PostgreSQL, MongoDB, Redis.
- **Frontend**: Vite, React, Vanilla CSS.
- **Infrastructure**: Docker Compose.
