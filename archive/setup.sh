#!/bin/bash

# LifeSync - Setup Script
# This script sets up the LifeSync application for development

echo "🚀 Setting up LifeSync..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 LifeSync setup complete!"
echo ""
echo "To start developing:"
echo "  npm run dev"
echo ""
echo "To start in production:"
echo "  npm start"
echo ""
echo "To deploy to Vercel:"
echo "  npm install -g vercel"
echo "  vercel --prod"
echo ""
echo "Happy Life Syncing! 🚀"