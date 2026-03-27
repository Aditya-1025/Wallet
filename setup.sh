
# Smart Wallet Setup Script
# This script checks prerequisites and helps set up the environment.

set -e

echo "🚀 Starting Smart Wallet Setup..."

# 1. Check Java Version
echo "🔍 Checking Java version..."
if type -p java > /dev/null; then
    _java=java
elif [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]]; then
    _java="$JAVA_HOME/bin/java"
else
    echo "❌ Java not found. Please install Java 21."
    exit 1
fi

if [[ "$_java" ]]; then
    version=$("$_java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
    if [[ "$version" < "21" ]]; then
        echo "❌ Java version is $version. Please install Java 21 or higher."
        exit 1
    else
        echo "✅ Java $version detected."
    fi
fi

# 2. Check Docker
echo "🔍 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
else
    echo "✅ Docker detected."
fi

# 3. Start Infrastructure
echo "🐳 Starting infrastructure (PostgreSQL, MongoDB, Redis)..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker/docker-compose.yml up -d
elif docker compose version &> /dev/null; then
    docker compose -f docker/docker-compose.yml up -d
else
    echo "❌ Docker Compose not found. Please install it."
    exit 1
fi

# 4. Build Project
echo "🏗️ Building project..."
./mvnw clean install -DskipTests

echo "✅ Setup complete! You can now run the backend and frontend."
echo "👉 Backend: cd backend && ../mvnw spring-boot:run"
echo "👉 Frontend: cd frontend && npm run dev"
