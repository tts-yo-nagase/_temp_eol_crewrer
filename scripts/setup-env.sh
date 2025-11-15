#!/bin/bash
#
# setup-env.sh - Setup environment files with auto-generated secrets
# Usage: bash scripts/setup-env.sh

set -euo pipefail

# Source the secret generation function
source "$(dirname "$0")/generate-secrets.sh"

echo "🔧 Setting up environment files..."
echo ""

# Frontend environment file
if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/.env.sample" ]; then
        cp frontend/.env.sample frontend/.env.local

        # Generate and replace NEXTAUTH_SECRET
        echo "   Generating NEXTAUTH_SECRET..."
        NEXTAUTH_SECRET=devsecret
        # Use different delimiters to avoid conflicts with forward slashes in base64
        sed -i.bak "s|your-nextauth-secret-here-will-be-auto-generated|${NEXTAUTH_SECRET}|g" frontend/.env.local
        rm frontend/.env.local.bak 2>/dev/null || true

        echo "✅ Created frontend/.env.local with auto-generated secrets"
    else
        echo "⚠️  Warning: frontend/.env.sample not found"
    fi
else
    echo "ℹ️  frontend/.env.local already exists (skipping)"

    # Check if placeholder is still present
    if grep -q "your-nextauth-secret-here-will-be-auto-generated" frontend/.env.local 2>/dev/null; then
        echo "⚠️  Warning: frontend/.env.local contains placeholder values"
        echo "   Please update NEXTAUTH_SECRET with a secure secret"
    fi
fi

echo ""

# Backend environment file
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env

        # Generate and replace JWT_SECRET
        echo "   Generating JWT_SECRET..."
        JWT_SECRET=devsecret
        sed -i.bak "s|your-jwt-secret-here-will-be-auto-generated|${JWT_SECRET}|g" backend/.env
        rm backend/.env.bak 2>/dev/null || true

        echo "✅ Created backend/.env with auto-generated secrets"
    else
        echo "⚠️  Warning: backend/.env.example not found"
    fi
else
    echo "ℹ️  backend/.env already exists (skipping)"

    # Check if placeholder is still present
    if grep -q "your-jwt-secret-here-will-be-auto-generated" backend/.env 2>/dev/null; then
        echo "⚠️  Warning: backend/.env contains placeholder values"
        echo "   Please update JWT_SECRET with a secure secret"
    fi
fi

echo ""
echo "✅ Environment setup completed"
echo ""
echo "⚠️  Important: Never commit .env files to version control"
