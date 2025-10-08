#!/bin/bash

# BRAINSAIT: Phase 4 Services Startup Script
# Starts all Phase 4 innovation services

set -e

echo "🚀 Starting SSDP Phase 4 Innovation Services..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
SERVICES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../services" && pwd)"

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local service_dir="${SERVICES_DIR}/${service_name}"
    
    echo -e "${BLUE}Starting ${service_name}...${NC}"
    
    if [ ! -d "$service_dir" ]; then
        echo -e "${YELLOW}⚠️  ${service_name} directory not found${NC}"
        return 1
    fi
    
    cd "$service_dir"
    
    # Check if requirements are installed
    if [ -f "requirements.txt" ]; then
        echo "Installing dependencies..."
        pip install -q -r requirements.txt
    fi
    
    # Start service in background
    python main.py &
    local pid=$!
    
    # Wait for service to start
    sleep 3
    
    # Check if service is running
    if curl -s "http://localhost:${port}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service_name} started successfully on port ${port}${NC}"
        echo "   PID: $pid"
    else
        echo -e "${YELLOW}⚠️  ${service_name} may have failed to start${NC}"
    fi
    
    echo ""
}

# Start all Phase 4 services
echo "================================================"
echo "🎥 Computer Vision Service (Port 8004)"
echo "================================================"
start_service "computer-vision-service" 8004

echo "================================================"
echo "🌐 IoT Integration Service (Port 8005)"
echo "================================================"
start_service "iot-integration-service" 8005

echo "================================================"
echo "⛓️  Blockchain Service (Port 8006)"
echo "================================================"
start_service "blockchain-service" 8006

echo "================================================"
echo "🚁 Autonomous Delivery Service (Port 8007)"
echo "================================================"
start_service "autonomous-delivery-service" 8007

echo ""
echo "================================================"
echo -e "${GREEN}✅ All Phase 4 services started!${NC}"
echo "================================================"
echo ""
echo "Service endpoints:"
echo "  • Computer Vision:       http://localhost:8004/docs"
echo "  • IoT Integration:       http://localhost:8005/docs"
echo "  • Blockchain:            http://localhost:8006/docs"
echo "  • Autonomous Delivery:   http://localhost:8007/docs"
echo ""
echo "To stop all services, run:"
echo "  pkill -f 'python main.py'"
echo ""
echo "For detailed documentation, see:"
echo "  docs/PHASE4_INNOVATIONS.md"
echo "  docs/PHASE4_INTEGRATION_EXAMPLES.md"
echo ""
