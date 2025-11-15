#!/bin/bash
#
# wait-for-db.sh - Wait for PostgreSQL database to be ready
# Usage: bash scripts/wait-for-db.sh
# Environment variables:
#   DB_WAIT_MAX_ATTEMPTS - Maximum number of attempts (default: 30)
#   DB_WAIT_SLEEP - Sleep duration between attempts in seconds (default: 5)

set -euo pipefail

# Configuration
MAX_ATTEMPTS=${DB_WAIT_MAX_ATTEMPTS:-30}
SLEEP_DURATION=${DB_WAIT_SLEEP:-5}

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available"
    exit 1
fi

echo "⏳ Waiting for database to be ready..."
echo "   (Checking every ${SLEEP_DURATION}s, max ${MAX_ATTEMPTS} attempts)"
attempt=0

until $DOCKER_COMPOSE exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -eq $MAX_ATTEMPTS ]; then
        echo "❌ Database failed to start within expected time"
        echo "   Attempted $MAX_ATTEMPTS times over $((MAX_ATTEMPTS * SLEEP_DURATION)) seconds"
        echo "   Check logs with: docker compose logs postgres"
        exit 1
    fi
    echo "   Waiting for database... (attempt $attempt/$MAX_ATTEMPTS)"
    sleep $SLEEP_DURATION
done

echo "✅ Database is ready"
