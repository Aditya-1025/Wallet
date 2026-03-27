📘 Database Setup Guide  
Internal Wallet Payment Platform

## 1. Prerequisites

Make sure you have these installed:

- **Docker Engine**
- **Docker Compose** (as a plugin via `docker compose` or classic `docker-compose`)
- **Java 17+**
- **Maven 3.8+**

Verify:

```bash
docker version
docker compose version   # or: docker-compose -v
java -version
mvn -v
```

If any of these commands fail, install the missing tool first.

---

## 2. Start Databases (PostgreSQL + MongoDB)

From the project root:

```bash
cd ~/Desktop/Smart-Wallet   # adjust path if different
docker compose -f docker/docker-compose.yml up -d
```

Check that containers are running:

```bash
docker ps
```

You should see:

- `smart_wallet_postgres` (PostgreSQL)
- `smart_wallet_mongo` (MongoDB)

### Connection details

**PostgreSQL**

- Host: `localhost`
- Port: `5432`
- Database: `smart_wallet_db`
- User: `postgres`
- Password: `postgres`

**MongoDB**

- Host: `localhost`
- Port: `27017`
- Database: `smart_wallet_onboarding`

These values match the Spring Boot `application.yml` configuration.

---

## 3. Run the Backend (Spring Boot)

From the backend folder:

```bash
cd ~/Desktop/Smart-Wallet/backend
mvn spring-boot:run
```

- The application starts on **port 8080**.
- Keep this terminal running; stop it with **Ctrl + C** when you’re done.

If startup is successful, you should see logs showing Tomcat started and no red `ERROR` lines.

---

## 4. Common Issues

### 4.1 Docker daemon not running

If you see:

> Cannot connect to the Docker daemon at unix:///var/run/docker.sock

Start Docker (systemd-based distros):

```bash
sudo systemctl start docker
```

On systems without systemd, you may need to run:

```bash
sudo dockerd
```

in a separate terminal.

### 4.2 Containers not healthy

If `docker ps` doesn’t show the containers or they’re restarting:

```bash
cd ~/Desktop/Smart-Wallet
docker compose -f docker/docker-compose.yml logs postgres
docker compose -f docker/docker-compose.yml logs mongodb
```

Check logs for missing environment variables, port conflicts, or permission issues.

---

## 5. Quick Start Summary for Teammates

```bash
# Clone repo
git clone <your-repo-url>
cd Smart-Wallet

# Start databases
docker compose -f docker/docker-compose.yml up -d

# Run backend
cd backend
mvn spring-boot:run
```

As long as Docker, Java 17, and Maven are installed, these commands are enough to get the databases and backend running locally.

