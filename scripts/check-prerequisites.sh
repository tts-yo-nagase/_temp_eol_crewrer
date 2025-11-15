#!/bin/bash
#
# check-prerequisites.sh - Check system prerequisites for app setup
# Validates: Node.js (v18+), pnpm (v8+), Docker
# Usage: bash scripts/check-prerequisites.sh

set -euo pipefail

ERRORS=0

echo "🔍 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Install from: https://nodejs.org/ (v18 or higher)"
    ERRORS=$((ERRORS + 1))
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version is too old (found v$NODE_VERSION, need v18+)"
        echo "   Current version: $(node -v)"
        echo "   Update from: https://nodejs.org/"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Node.js $(node -v)"
    fi
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    echo "   Install with: npm install -g pnpm"
    echo "   Or visit: https://pnpm.io/installation"
    ERRORS=$((ERRORS + 1))
else
    PNPM_VERSION=$(pnpm -v | cut -d'.' -f1)
    if [ "$PNPM_VERSION" -lt 8 ]; then
        echo "⚠️  pnpm version is old (found v$(pnpm -v), recommend v8+)"
        echo "   Update with: npm install -g pnpm@latest"
    else
        echo "✅ pnpm v$(pnpm -v)"
    fi
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "   Install from: https://www.docker.com/get-started"
    ERRORS=$((ERRORS + 1))
else
    if ! docker info &> /dev/null; then
        echo "❌ Docker is installed but not running"
        echo "   Start Docker Desktop or Docker daemon"
        ERRORS=$((ERRORS + 1))
    else
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        echo "✅ Docker v$DOCKER_VERSION (running)"
    fi
fi

# Check Docker Compose
if ! command -v docker &> /dev/null; then
    : # Docker not installed, already reported above
elif docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || docker compose version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    echo "✅ Docker Compose v$COMPOSE_VERSION"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    echo "✅ docker-compose v$COMPOSE_VERSION (legacy)"
else
    echo "❌ Docker Compose is not available"
    echo "   Install Docker Desktop (includes Compose)"
    ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -gt 0 ]; then
    echo "❌ $ERRORS prerequisite check(s) failed"
    echo "   Please install missing dependencies before running setup"
    exit 1
else
    echo "✅ All prerequisites satisfied"
    exit 0
fi
