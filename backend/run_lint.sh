#!/bin/bash
set -e
echo "Running ruff linter..."
ruff check app/ tests/
echo "Running ruff formatter check..."
ruff format --check app/ tests/

