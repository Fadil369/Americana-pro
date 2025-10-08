#!/bin/bash

# SSDP Cloudflare Deployment Script
# Deploy Workers API and Pages Frontend

set -e

echo "🚀 Starting SSDP Cloudflare Deployment..."

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

echo -e "${BLUE}📦 Building and deploying Workers API...${NC}"

# Deploy Workers API
cd cf-workers/ssdp-api

# Install dependencies
echo "Installing dependencies..."
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Create D1 database if it doesn't exist
echo "Setting up D1 database..."
wrangler d1 create ssdp-database --experimental || echo "Database might already exist"

# Apply database schema
echo "Applying database schema..."
wrangler d1 execute ssdp-database --file=schema.sql --remote

# Create KV namespace if it doesn't exist
echo "Setting up KV namespace..."
wrangler kv:namespace create "SSDP_KV" || echo "KV namespace might already exist"

# Create R2 bucket if it doesn't exist
echo "Setting up R2 bucket..."
wrangler r2 bucket create ssdp-assets || echo "R2 bucket might already exist"

# Set secrets
echo "Setting up secrets..."
echo "Please set the following secrets manually:"
echo "wrangler secret put WATHQ_API_KEY"
echo "wrangler secret put ZATCA_API_KEY"
echo "wrangler secret put JWT_SECRET"

# Deploy to staging first
echo "Deploying to staging..."
wrangler deploy --env staging

# Deploy to production
echo "Deploying to production..."
wrangler deploy --env production

echo -e "${GREEN}✅ Workers API deployed successfully!${NC}"

# Deploy Pages Frontend
cd ../../cf-pages

echo -e "${BLUE}🌐 Deploying Pages Frontend...${NC}"

# Optimize assets
echo "Optimizing assets..."

# Minify CSS
if command -v cleancss &> /dev/null; then
    cleancss -o assets/css/main.min.css assets/css/main.css
    cleancss -o assets/css/components.min.css assets/css/components.css
else
    echo -e "${YELLOW}⚠️  cleancss not found. CSS not minified.${NC}"
fi

# Minify JavaScript
if command -v terser &> /dev/null; then
    terser assets/js/main.js -o assets/js/main.min.js --compress --mangle
    terser assets/js/components.js -o assets/js/components.min.js --compress --mangle
else
    echo -e "${YELLOW}⚠️  terser not found. JavaScript not minified.${NC}"
fi

# Deploy to Cloudflare Pages
wrangler pages deploy . --project-name=ssdp-platform --compatibility-date=2024-01-01

echo -e "${GREEN}✅ Pages Frontend deployed successfully!${NC}"

# Setup custom domains (if configured)
echo -e "${BLUE}🔗 Setting up custom domains...${NC}"

# API domain
wrangler route add "api.ssdp.brainsait.com/*" ssdp-api || echo "Route might already exist"

# Frontend domain
echo "Please configure custom domain for Pages in Cloudflare Dashboard:"
echo "https://dash.cloudflare.com -> Pages -> ssdp-platform -> Custom domains"

echo ""
echo -e "${GREEN}🎉 SSDP Platform deployment completed!${NC}"
echo ""
echo -e "${BLUE}📊 Access Points:${NC}"
echo "   • API (Production): https://ssdp-api.brainsait.workers.dev"
echo "   • API (Custom): https://api.ssdp.brainsait.com"
echo "   • Frontend: https://ssdp-platform.pages.dev"
echo "   • Frontend (Custom): https://ssdp.brainsait.com"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "   1. Configure custom domains in Cloudflare Dashboard"
echo "   2. Set up DNS records for your domains"
echo "   3. Configure SSL certificates"
echo "   4. Set up monitoring and analytics"
echo ""
echo -e "${BLUE}📱 Mobile App Integration:${NC}"
echo "   Update API_BASE_URL in mobile app to: https://api.ssdp.brainsait.com"
echo ""
echo "Built with ❤️ by BrainSAIT for Saudi Arabia's digital transformation 🇸🇦"
