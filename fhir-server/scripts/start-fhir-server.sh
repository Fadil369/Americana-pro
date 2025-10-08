#!/bin/bash

# BrainSAIT FHIR Server Startup Script

set -e

echo "🚀 Starting BrainSAIT FHIR Server..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file. Please review and update if needed.${NC}"
fi

# Navigate to fhir-server directory
cd "$(dirname "$0")/.."

echo -e "${BLUE}📦 Pulling latest Docker images...${NC}"
docker-compose pull

echo -e "${BLUE}🔨 Building containers...${NC}"
docker-compose build

echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✅ BrainSAIT FHIR Server is starting!${NC}"
echo ""
echo "Services:"
echo "  - FHIR Server: http://localhost:8080/fhir"
echo "  - FHIR UI: http://localhost:8080"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""

# Wait for health check
echo -e "${BLUE}⏳ Waiting for FHIR server to be ready...${NC}"
RETRIES=30
COUNT=0

while [ $COUNT -lt $RETRIES ]; do
    if curl -sf http://localhost:8080/fhir/metadata > /dev/null 2>&1; then
        echo -e "${GREEN}✅ FHIR Server is ready!${NC}"
        echo ""
        echo "🔍 Server Metadata:"
        curl -s http://localhost:8080/fhir/metadata | jq -r '.software.name, .fhirVersion' 2>/dev/null || echo "FHIR R4 Server Running"
        echo ""
        echo -e "${GREEN}BrainSAIT OID Base: 1.3.6.1.4.1.61026${NC}"
        echo "  - Sudan: .1"
        echo "  - Saudi Arabia: .2"
        echo ""
        echo "✅ Ready for integration!"
        exit 0
    fi

    COUNT=$((COUNT+1))
    echo "Attempt $COUNT/$RETRIES - waiting..."
    sleep 2
done

echo -e "${RED}❌ FHIR Server failed to start within expected time${NC}"
echo "Check logs with: docker-compose logs fhir-server"
exit 1
