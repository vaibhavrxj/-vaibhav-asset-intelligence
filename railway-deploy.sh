#!/bin/bash
# Railway Deployment Script

echo "🚀 Starting Asset Verifier System deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --no-cache

# Build application
echo "🔨 Building application..."
npm run build

echo "✅ Build complete - ready for Railway deployment!"