#!/bin/bash

echo "🚀 Preparing EC2 Deployment..."

# 1. Check for PM2
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Please install it with: npm install -g pm2"
    exit 1
fi

# 2. Check for UV (Python package manager)
if ! command -v uv &> /dev/null; then
    echo "❌ UV not found. Please install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# 3. Build/Install Dependencies
echo "📦 Installing Bridge dependencies..."
(cd whatsapp-bridge && pnpm install)

echo "📦 Syncing Backend environment..."
(cd backend && uv sync)

# 4. Start services with PM2
echo "⚡ Starting services with PM2..."
pm2 delete whatsapp-bridge backend-automation &> /dev/null || true
pm2 start ecosystem.config.js

# 5. Save PM2 list for persistence after reboot
echo "💾 Saving PM2 process list..."
pm2 save

echo ""
echo "✅ Deployment Complete!"
echo "Use 'pm2 status' to view running services."
echo "Use 'pm2 logs' to view logs."
