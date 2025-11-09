#!/bin/bash
# Backend test runner script with coverage reporting

set -e

echo "🧪 Running Backend Tests..."
echo "================================"

# Run pytest with coverage
pytest tests/ \
    --cov=app \
    --cov-report=html \
    --cov-report=term-missing \
    --cov-report=xml \
    -v

echo ""
echo "✅ Tests complete!"
echo "📊 Coverage report: htmlcov/index.html"

