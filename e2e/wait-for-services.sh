#!/bin/bash
# Wait for backend and frontend services to be ready

set -e

echo "Waiting for backend to be ready..."
timeout=30
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if curl -s http://backend:8000/docs > /dev/null 2>&1; then
        echo "✓ Backend is ready"
        break
    fi
    sleep 1
    elapsed=$((elapsed + 1))
done

if [ $elapsed -ge $timeout ]; then
    echo "✗ Backend failed to start within $timeout seconds"
    exit 1
fi

echo "Waiting for frontend to be ready..."
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if curl -s http://frontend:3000 > /dev/null 2>&1; then
        echo "✓ Frontend is ready"
        break
    fi
    sleep 1
    elapsed=$((elapsed + 1))
done

if [ $elapsed -ge $timeout ]; then
    echo "✗ Frontend failed to start within $timeout seconds"
    exit 1
fi

echo "✓ All services ready, starting tests..."


