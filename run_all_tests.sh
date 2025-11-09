#!/bin/bash
# Run all tests: backend, frontend, and E2E using Docker

set -e

echo "🚀 Running All Tests for Track the Thing"
echo "========================================"
echo ""

# Backend Tests
echo "1️⃣  Backend Tests"
echo "-------------------"
echo "Running backend tests in Docker..."
docker-compose run --rm backend-test
echo ""

# Frontend Tests
echo "2️⃣  Frontend Tests"
echo "-------------------"
echo "Running frontend tests in Docker..."
docker-compose run --rm frontend-test
echo ""

# E2E Tests
echo "3️⃣  E2E Tests"
echo "-------------------"
echo "Running E2E tests in Docker..."
docker-compose --profile e2e run --rm e2e npx playwright test --grep-invert "media-features"
echo ""

echo "✅ All tests complete!"
echo "================================"
echo "📊 Backend coverage: tests/backend/htmlcov/index.html"
echo "📊 Frontend coverage: tests/frontend/coverage/index.html"
echo "📊 E2E report: tests/e2e/playwright-report/index.html"

