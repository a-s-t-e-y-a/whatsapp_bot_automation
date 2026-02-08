#!/bin/bash

# Function to kill background processes on exit
cleanup() {
  echo ""
  echo "Stopping services..."
  kill $(jobs -p) 2>/dev/null
  exit
}

trap cleanup SIGINT SIGTERM

case "$1" in
  "dev")
    echo "🚀 Starting Backend & Frontend in dev mode..."
    (cd backend && PYTHONPATH=. uv run src/main.py) &
    (cd frontend && pnpm dev)
    wait
    ;;
  "build")
    echo "🏗️ Building Frontend..."
    cd frontend && pnpm build
    ;;
  "start")
    echo "🌐 Starting in production/preview mode..."
    (cd backend && PYTHONPATH=. uv run src/main.py) &
    (cd frontend && pnpm preview)
    wait
    ;;
  "frontend")
    echo "🎨 Starting Frontend..."
    cd frontend && pnpm dev
    ;;
  "backend")
    echo "⚙️ Starting Backend..."
    cd backend && PYTHONPATH=. uv run src/main.py
    ;;
  *)
    echo "Usage: ./manage.sh {dev|build|start|frontend|backend}"
    echo ""
    echo "Options:"
    echo "  dev      - Run both backend & frontend in parallel"
    echo "  build    - Build the frontend project"
    echo "  start    - Run backend and frontend preview"
    echo "  frontend - Run only frontend"
    echo "  backend  - Run only backend"
    exit 1
    ;;
esac
