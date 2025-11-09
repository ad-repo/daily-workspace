#!/bin/bash
# Frontend test runner script with coverage reporting

set -e

echo "🧪 Running Frontend Tests..."
echo "================================"

# Run vitest with coverage
npm run test:coverage

echo ""
echo "✅ Tests complete!"
echo "📊 Coverage report: coverage/index.html"

