#!/usr/bin/env bash
# Start the backend server with database initialization
set -e

cd "$(dirname "$0")"

echo "============================================="
echo "  Anker AI Earbuds Simulation - Backend"
echo "============================================="

# Check Python
if ! command -v python &> /dev/null; then
    echo "Error: python is not installed"
    exit 1
fi

echo "Python: $(python --version)"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
elif [ -f "venv/bin/activate" ]; then
    source venv/activate
fi

echo "Installing dependencies..."
pip install -r requirements.txt -q

# Create data directory
mkdir -p data

echo ""
echo "Starting server on http://localhost:8000"
echo "API docs: http://localhost:8000/docs"
echo ""

python -m backend.main
