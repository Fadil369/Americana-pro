#!/bin/bash

# SSDP Platform Deployment Script
# Built with ❤️ in Saudi Arabia 🇸🇦

set -e

echo "🍯 Starting SSDP Platform Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p certificates
mkdir -p logs
mkdir -p monitoring/grafana/{dashboards,datasources}

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
echo "🏥 Performing health checks..."

# Check Distribution Service
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Distribution Service is healthy"
else
    echo "❌ Distribution Service is not responding"
fi

# Check AI Forecasting Service
if curl -f http://localhost:8001/ > /dev/null 2>&1; then
    echo "✅ AI Forecasting Service is healthy"
else
    echo "❌ AI Forecasting Service is not responding"
fi

# Check Database
if docker-compose exec -T postgres pg_isready -U ssdp_user > /dev/null 2>&1; then
    echo "✅ PostgreSQL Database is healthy"
else
    echo "❌ PostgreSQL Database is not responding"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis Cache is healthy"
else
    echo "❌ Redis Cache is not responding"
fi

echo ""
echo "🎉 SSDP Platform deployment completed!"
echo ""
echo "📊 Access Points:"
echo "   • Distribution API: http://localhost:8000"
echo "   • AI Forecasting API: http://localhost:8001"
echo "   • Grafana Dashboard: http://localhost:3000 (admin/admin)"
echo "   • Prometheus: http://localhost:9090"
echo ""
echo "📱 Next Steps:"
echo "   1. Start mobile development: cd apps/ssdp-mobile && npm start"
echo "   2. Start web development: cd apps/ssdp-web && npm run dev"
echo "   3. Deploy Cloudflare Workers: cd workers && wrangler deploy"
echo ""
echo "Built with ❤️ by BrainSAIT for Saudi Arabia's digital transformation 🇸🇦"
