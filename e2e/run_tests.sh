#!/bin/bash
# Run E2E tests with Playwright in Docker

set -e

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
    cd ..
    docker-compose build e2e
    
    echo "Starting backend and frontend services..."
    docker-compose up -d backend frontend
    
    echo "Waiting for services to be ready..."
    sleep 5
    
    echo "Running E2E tests in container..."
    docker-compose run --rm e2e
    
    cd e2e
fi

echo ""
echo "======================================"
echo "E2E Tests Complete"
echo "======================================"
echo "HTML report available at: playwright-report/index.html"
echo "To view: npx playwright show-report"
