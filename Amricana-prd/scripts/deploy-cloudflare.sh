#!/bin/bash

# SSDP Unified Cloudflare Deployment Script
# Deploys both Next.js web app and Workers API

set -e

echo "🚀 Starting SSDP Unified Cloudflare Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Please install it first:${NC}"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please login first:${NC}"
    echo "wrangler login"
    exit 1
fi

echo -e "${BLUE}📦 Building Next.js Web Application...${NC}"

# Build Next.js app
cd apps/ssdp-web

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build with Cloudflare adapter
echo "Building for Cloudflare Pages..."
npm run build
npx @cloudflare/next-on-pages

echo -e "${GREEN}✅ Next.js build completed!${NC}"

# Deploy to Cloudflare Pages
echo -e "${BLUE}🌐 Deploying to Cloudflare Pages...${NC}"

wrangler pages deploy .vercel/output/static --project-name=ssdp-platform --compatibility-date=2024-01-01

echo -e "${GREEN}✅ Pages deployment completed!${NC}"

# Deploy Workers API (if needed)
cd ../../cf-workers/ssdp-api

echo -e "${BLUE}⚡ Deploying Workers API...${NC}"

if [ ! -d "node_modules" ]; then
    echo "Installing Worker dependencies..."
    npm install
fi

wrangler deploy

echo -e "${GREEN}✅ Workers API deployment completed!${NC}"

cd ../../

echo ""
echo -e "${GREEN}🎉 SSDP Platform deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Access Points:${NC}"
echo "   • Web App: https://ssdp-platform.pages.dev"
echo "   • API: https://ssdp-api.dr-mf-12298.workers.dev"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "   1. Configure custom domains in Cloudflare Dashboard"
echo "   2. Set up environment variables in Pages settings"
echo "   3. Configure DNS records for your domains"
echo "   4. Set up monitoring and analytics"
echo ""
echo "Built with ❤️ by BrainSAIT for Saudi Arabia's digital transformation 🇸🇦"
