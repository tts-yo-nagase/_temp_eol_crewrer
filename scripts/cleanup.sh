#!/bin/bash
#
# cleanup.sh - Clean up development environment
# Stops containers, removes generated files (optional)
# Usage: pnpm run cleanup

set -euo pipefail

echo "🧹 Cleaning up development environment..."
echo ""

# Stop Docker containers
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "Stopping Docker containers..."
    docker compose down
    echo "✅ Docker containers stopped"
else
    echo "ℹ️  Docker not running, skipping container cleanup"
fi

# echo ""
# read -p "Remove generated environment files? (y/N) " -n 1 -r
# echo ""

# if [[ $REPLY =~ ^[Yy]$ ]]; then
#     # Remove generated env files
#     if [ -f "frontend/.env.local" ]; then
#         rm frontend/.env.local
#         echo "✅ Removed frontend/.env.local"
#     fi

#     if [ -f "backend/.env" ]; then
#         rm backend/.env
#         echo "✅ Removed backend/.env"
#     fi
# fi

echo ""
read -p "Remove node_modules and reinstall? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remove node_modules
    echo "Removing node_modules..."
    rm -rf node_modules backend/node_modules frontend/node_modules
    echo "✅ Removed node_modules"

    # Remove lockfile
    if [ -f "pnpm-lock.yaml" ]; then
        rm pnpm-lock.yaml
        echo "✅ Removed pnpm-lock.yaml"
    fi

    echo ""
    read -p "Reinstall dependencies now? (y/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pnpm install
        echo "✅ Dependencies reinstalled"
    fi
fi

echo ""
read -p "Remove Docker volumes (⚠️  deletes database data)? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v docker &> /dev/null; then
        docker compose down -v
        echo "✅ Docker volumes removed"
    fi
fi

echo ""
echo "✅ Cleanup completed"
echo ""
echo "To start fresh, run: pnpm run setup"
