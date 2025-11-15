#!/bin/bash
#
# setup.sh - Automated setup script for App Template
# Prerequisites: Node.js 18+, pnpm 8+, Docker
# Usage: pnpm run setup

set -euo pipefail

# Trap errors and cleanup
cleanup_on_error() {
    echo ""
    echo "❌ Setup failed. Run 'pnpm run cleanup' to clean up if needed."
    exit 1
}

trap cleanup_on_error ERR

echo "=========================================="
echo "Starting Application Setup"
echo "=========================================="
echo ""

# 0. Check prerequisites
echo "📋 Checking prerequisites..."
bash "$(dirname "$0")/check-prerequisites.sh"
echo ""

# 1. Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# 2. Setup environment files
echo "🔧 Setting up environment files..."
bash "$(dirname "$0")/setup-env.sh"
echo ""

# 3. Start database
echo "🐘 Starting PostgreSQL database..."
if docker compose version &> /dev/null; then
    docker compose up -d postgres
elif command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available"
    exit 1
fi
echo "✅ PostgreSQL container started"
echo ""

# 4. Wait for database to be ready
bash "$(dirname "$0")/wait-for-db.sh"
echo ""

# 5. Setup backend (Prisma migrations, generate, seed)
echo "🗄️  Setting up backend database..."
echo "   This may take a few minutes..."
pnpm --filter backend run setup
echo "✅ Backend setup completed"
echo ""

# 6. Start applications
echo "=========================================="
echo "🚀 Setup completed successfully!"
echo "=========================================="
echo ""
echo "Starting development servers..."
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3010"
echo "- API Docs: http://localhost:3010/api-docs"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""
pnpm run dev
