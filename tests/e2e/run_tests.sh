#!/bin/bash
# Run E2E tests with Playwright in Docker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_CMD="docker-compose --env-file $REPO_ROOT/.dockerenv"

echo "======================================"
echo "Running E2E Tests with Playwright"
echo "======================================"

# Check if running in Docker
if [ -f "/.dockerenv" ]; then
    # Running inside Docker container
    echo "Running tests in Docker container..."
    npx playwright test --reporter=list --reporter=html
else
    # Running on host machine
    echo "Building E2E container..."
    (cd "$REPO_ROOT" && $COMPOSE_CMD build e2e)
    
    echo "Starting backend and frontend services..."
    (cd "$REPO_ROOT" && $COMPOSE_CMD up -d backend frontend)
    
    echo "Waiting for services to be ready..."
    sleep 5
    
    echo "Running E2E tests in container..."
    (cd "$REPO_ROOT" && $COMPOSE_CMD run --rm e2e)
fi

echo ""
echo "======================================"
echo "E2E Tests Complete"
echo "======================================"
echo "HTML report available at: playwright-report/index.html"
echo "To view: npx playwright show-report"
