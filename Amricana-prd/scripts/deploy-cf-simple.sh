#!/bin/bash

# SSDP Cloudflare Deployment Script (Simplified)
# Deploy only Workers API and Pages Frontend

set -e

echo "🚀 Starting SSDP Cloudflare Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building and deploying Workers API...${NC}"

# Deploy Workers API
cd cf-workers/ssdp-api

# Create package.json for Workers
cat > package.json << EOF
{
  "name": "ssdp-api",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "build": "echo 'Build complete'",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "itty-router": "^4.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240925.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Create D1 database
echo "Setting up D1 database..."
wrangler d1 create ssdp-database || echo "Database might already exist"

# Get database ID and update wrangler.toml
DB_ID=$(wrangler d1 list | grep ssdp-database | awk '{print $2}' | head -1)
if [ ! -z "$DB_ID" ]; then
    sed -i '' "s/your-d1-database-id/$DB_ID/g" wrangler.toml
fi

# Apply database schema
echo "Applying database schema..."
wrangler d1 execute ssdp-database --file=schema.sql --remote || echo "Schema might already exist"

# Create KV namespace
echo "Setting up KV namespace..."
KV_ID=$(wrangler kv:namespace create "SSDP_KV" --preview | grep "id" | awk '{print $3}' | tr -d '"' | head -1)
if [ ! -z "$KV_ID" ]; then
    sed -i '' "s/your-kv-namespace-id/$KV_ID/g" wrangler.toml
fi

# Create R2 bucket
echo "Setting up R2 bucket..."
wrangler r2 bucket create ssdp-assets || echo "R2 bucket might already exist"

# Deploy Workers
echo "Deploying Workers API..."
wrangler deploy

echo -e "${GREEN}✅ Workers API deployed successfully!${NC}"

# Deploy Pages Frontend
cd ../../cf-pages

echo -e "${BLUE}🌐 Deploying Pages Frontend...${NC}"

# Deploy to Cloudflare Pages
wrangler pages deploy . --project-name=ssdp-platform --compatibility-date=2024-01-01

echo -e "${GREEN}✅ Pages Frontend deployed successfully!${NC}"

echo ""
echo -e "${GREEN}🎉 SSDP Platform deployment completed!${NC}"
echo ""
echo -e "${BLUE}📊 Access Points:${NC}"
echo "   • Workers API: https://ssdp-api.dr-mf-12298-gmail-com.workers.dev"
echo "   • Pages Frontend: https://ssdp-platform.pages.dev"
echo ""
echo "Built with ❤️ by BrainSAIT for Saudi Arabia's digital transformation 🇸🇦"
