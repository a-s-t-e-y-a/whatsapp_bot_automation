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
    echo "🚀 Starting Backend, Frontend & WhatsApp Bridge in dev mode..."
    (cd backend && PYTHONPATH=. uv run src/main.py) &
    (cd whatsapp-bridge && pnpm start) &
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
    (cd whatsapp-bridge && pnpm start) &
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
  "whatsapp")
    echo "📱 Starting WhatsApp Bridge..."
    cd whatsapp-bridge && pnpm start
    ;;
  *)
    echo "Usage: ./manage.sh {dev|build|start|frontend|backend|whatsapp}"
    echo ""
    echo "Options:"
    echo "  dev      - Run backend, frontend & whatsapp bridge in parallel"
    echo "  build    - Build the frontend project"
    echo "  start    - Run backend, frontend preview & whatsapp bridge"
    echo "  frontend - Run only frontend"
    echo "  backend  - Run only backend"
    echo "  whatsapp - Run only whatsapp bridge"
    exit 1
    ;;
esac
