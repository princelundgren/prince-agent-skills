#!/usr/bin/env bash
set -euo pipefail

mkdir -p config
cat > README.md <<'EOF'
# orders-api

Takes orders from the shop and hands them to the warehouse.

A failed call to the warehouse is retried 3 times, one second apart.
EOF
cat > config/warehouse.yaml <<'EOF'
endpoint: https://warehouse.example.com/v2
timeout_seconds: 10
retry:
  retries: 7
  backoff_seconds: 2
EOF
