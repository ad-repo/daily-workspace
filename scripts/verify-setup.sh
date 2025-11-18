#!/bin/bash

echo "🔍 Verifying Track the Thing Setup..."
echo ""

ERRORS=0

# Check Python
echo "Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "  ✅ $PYTHON_VERSION"
else
    echo "  ❌ Python 3 not found"
    ERRORS=$((ERRORS + 1))
fi

# Check uv
echo "Checking uv (recommended)..."
if command -v uv &> /dev/null; then
    UV_VERSION=$(uv --version)
    echo "  ✅ $UV_VERSION"
else
    echo "  ⚠️  uv not found (will be installed by setup script)"
fi

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js $NODE_VERSION"
else
    echo "  ❌ Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  ✅ npm $NPM_VERSION"
else
    echo "  ❌ npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check Docker (optional)
echo "Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "  ✅ $DOCKER_VERSION"
else
    echo "  ⚠️  Docker not found (optional for local dev)"
fi

# Check project structure
echo ""
echo "Checking project structure..."

declare -a REQUIRED_FILES=(
    "backend/requirements.txt"
    "backend/app/main.py"
    "backend/app/models.py"
    "frontend/package.json"
    "frontend/src/App.tsx"
    "docker-compose.yml"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check if backend dependencies are installed
echo ""
echo "Checking backend setup..."
if [ -d "backend/venv" ]; then
    echo "  ✅ Virtual environment exists"
    
    if [ -f "backend/venv/bin/activate" ]; then
        source backend/venv/bin/activate
        if command -v uvicorn &> /dev/null; then
            echo "  ✅ Uvicorn installed"
        else
            echo "  ⚠️  Uvicorn not found (run: uv pip install -r requirements.txt)"
        fi
        deactivate
    fi
else
    echo "  ⚠️  Virtual environment not found (run: python3 -m venv backend/venv)"
fi

# Check if frontend dependencies are installed
echo ""
echo "Checking frontend setup..."
if [ -d "frontend/node_modules" ]; then
    echo "  ✅ Node modules installed"
else
    echo "  ⚠️  Node modules not found (run: cd frontend && npm install)"
fi

# Check ports
echo ""
echo "Checking if ports are available..."

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ⚠️  Port 8000 is in use (backend port)"
else
    echo "  ✅ Port 8000 is available"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ⚠️  Port 3000 is in use (frontend port)"
else
    echo "  ✅ Port 3000 is available"
fi

# Summary
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Setup verification PASSED!"
    echo ""
    echo "You're ready to start! Choose one option:"
    echo ""
    echo "Option 1 - Docker (easiest):"
    echo "  docker-compose --env-file .dockerenv up --build"
    echo ""
    echo "Option 2 - Local development:"
    echo "  Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "💡 Tip: Use 'uv' for 10-100x faster Python dependency management!"
    echo "   See UV_SETUP.md for details"
else
    echo "❌ Setup verification found $ERRORS error(s)"
    echo "Please fix the issues above before starting."
fi
echo "================================"

