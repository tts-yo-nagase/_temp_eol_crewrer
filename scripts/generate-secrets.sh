#!/bin/bash
#
# generate-secrets.sh - Generate secure random secrets for environment files
# Usage: source scripts/generate-secrets.sh (to use in other scripts)
#        or bash scripts/generate-secrets.sh (standalone)

set -euo pipefail

# Function to generate a secure random secret
generate_secret() {
    if command -v openssl &> /dev/null; then
        # Use openssl to generate 32 bytes of random data, base64 encoded
        openssl rand -base64 32 | tr -d '\n'
    else
        # Fallback to /dev/urandom if openssl is not available
        head -c 32 /dev/urandom | base64 | tr -d '\n'
    fi
}

# If script is run directly (not sourced), generate and print a secret
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "Generated secret:"
    generate_secret
    echo ""
fi
