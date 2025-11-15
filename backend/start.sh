#!/bin/bash
# Startup script that runs migrations before starting the server

set -e

echo "Starting daily-notes backend..."
echo ""

# Run database migrations (don't fail if migrations have issues)
echo "Running database migrations..."
python3 migrations/run_migrations.py || echo "⚠️  Some migrations failed, but continuing..."

echo ""
echo "Starting uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

