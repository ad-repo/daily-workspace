#!/bin/bash
set -e

echo "=========================================="
echo "Testing EXACTLY like CI"
echo "=========================================="

echo ""
echo "1. Backend Linting..."
cd backend
./run_lint.sh
cd ..

echo ""
echo "2. Frontend Linting (ESLint)..."
cd frontend
npm run lint

echo ""
echo "3. Frontend TypeScript Check..."
npx tsc --noEmit
cd ..

echo ""
echo "=========================================="
echo "✅ All CI checks passed locally!"
echo "=========================================="

