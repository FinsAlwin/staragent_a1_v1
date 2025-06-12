#!/bin/bash

echo "🚀 Starting build process..."

# Check Node.js version
echo "📋 Node.js version:"
node --version

echo "📋 NPM version:"
npm --version

# Install dependencies with legacy peer deps to handle compatibility issues
echo "📦 Installing dependencies..."
npm ci --cache .npm --prefer-offline --legacy-peer-deps

# Run build
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!" 