#!/bin/bash
# Run all tests: backend, frontend, and E2E using Docker
# Usage: ./run_all_tests.sh [backend|frontend|e2e]
# Examples:
#   ./run_all_tests.sh           # Run all tests
#   ./run_all_tests.sh backend   # Run only backend tests
#   ./run_all_tests.sh frontend  # Run only frontend tests
#   ./run_all_tests.sh e2e       # Run only E2E tests

set -e

COMPOSE_CMD="docker-compose --env-file .dockerenv"

# Parse arguments
RUN_BACKEND=false
RUN_FRONTEND=false
RUN_E2E=false

if [ $# -eq 0 ]; then
  # No arguments - run all tests
  RUN_BACKEND=true
  RUN_FRONTEND=true
  RUN_E2E=true
else
  # Parse which tests to run
  for arg in "$@"; do
    case $arg in
      backend)
        RUN_BACKEND=true
        ;;
      frontend)
        RUN_FRONTEND=true
        ;;
      e2e)
        RUN_E2E=true
        ;;
      *)
        echo "❌ Unknown test suite: $arg"
        echo "Usage: $0 [backend|frontend|e2e]"
        exit 1
        ;;
    esac
  done
fi

echo "🚀 Running Tests for Track the Thing"
echo "========================================"
echo ""

# Backend Tests
if [ "$RUN_BACKEND" = true ]; then
  echo "1️⃣  Backend Tests"
  echo "-------------------"
  echo "Running backend tests in Docker..."
  $COMPOSE_CMD run --rm backend-test
  echo ""
fi

# Frontend Tests
if [ "$RUN_FRONTEND" = true ]; then
  echo "2️⃣  Frontend Tests"
  echo "-------------------"
  echo "Running frontend tests in Docker..."
  $COMPOSE_CMD run --rm frontend-test
  echo ""
fi

# E2E Tests
if [ "$RUN_E2E" = true ]; then
  echo "3️⃣  E2E Tests"
  echo "-------------------"
  echo "Running E2E tests in Docker..."
  $COMPOSE_CMD --profile e2e run --rm e2e npx playwright test --grep-invert "media-features"
  echo ""
fi

echo "✅ Tests complete!"
echo "================================"
if [ "$RUN_BACKEND" = true ]; then
  echo "📊 Backend coverage: tests/backend/htmlcov/index.html"
fi
if [ "$RUN_FRONTEND" = true ]; then
  echo "📊 Frontend coverage: frontend/tests/coverage/index.html"
fi
if [ "$RUN_E2E" = true ]; then
  echo "📊 E2E report: tests/e2e/playwright-report/index.html"
fi

