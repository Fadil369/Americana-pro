# Phase 4 Innovation Services

This directory contains the Phase 4 innovation services for the SSDP platform, implementing cutting-edge technologies for the future of sweet distribution in Saudi Arabia.

## 📁 Services Overview

### 1. Computer Vision Service (`computer-vision-service/`)
**Port**: 8004

AI-powered image analysis for quality control and compliance monitoring.

**Features**:
- Shelf compliance analysis with scoring
- Product damage detection (4 levels)
- Counterfeit verification
- Expiry date OCR (Arabic & English)
- Historical trend analytics

**Key Endpoints**:
- `POST /analyze/shelf-compliance` - Analyze shelf organization
- `POST /analyze/damage-detection` - Detect product damage
- `POST /analyze/counterfeit-check` - Verify authenticity
- `POST /analyze/expiry-date` - Extract expiry dates
- `GET /analytics/compliance-trends` - Compliance analytics

### 2. IoT Integration Service (`iot-integration-service/`)
**Port**: 8005

Real-time IoT device management and monitoring.

**Features**:
- Smart cooler temperature monitoring (15-25°C)
- RFID product tracking
- Smart scale weight verification
- Real-time WebSocket alerts
- Device health monitoring

**Key Endpoints**:
- `POST /devices/register` - Register IoT device
- `POST /readings/temperature` - Log temperature
- `POST /readings/rfid` - Log RFID scan
- `POST /readings/weight` - Log weight measurement
- `WebSocket /ws/realtime` - Real-time updates

### 3. Blockchain Service (`blockchain-service/`)
**Port**: 8006

Immutable record-keeping and smart contract automation.

**Features**:
- Tamper-proof delivery records
- Smart contract execution
- Halal certification tracking
- Supply chain traceability
- SHA-256 cryptographic security

**Key Endpoints**:
- `POST /delivery/record` - Create delivery record
- `POST /contract/create` - Deploy smart contract
- `POST /halal/certify` - Record halal certification
- `GET /blockchain/verify` - Verify chain integrity
- `GET /origin/trace/{product_id}` - Trace supply chain

### 4. Autonomous Delivery Service (`autonomous-delivery-service/`)
**Port**: 8007

AI-powered autonomous vehicle and drone delivery management.

**Features**:
- Drone delivery planning (5-15kg, 10-30km)
- Autonomous vehicle routing (100-500kg)
- Delivery robot coordination
- Fleet management and tracking
- Safety and weather monitoring

**Key Endpoints**:
- `POST /vehicles/register` - Register autonomous vehicle
- `POST /missions/create` - Create delivery mission
- `POST /route/optimize` - Optimize multi-stop route
- `POST /safety/check` - Pre-flight safety check
- `GET /fleet/status` - Fleet overview

## 🚀 Quick Start

### Option 1: Start All Services (Recommended)

```bash
# From the Amricana-prd directory
./scripts/start-phase4-services.sh
```

### Option 2: Start Individual Services

```bash
# Computer Vision Service
cd services/computer-vision-service
pip install -r requirements.txt
python main.py

# IoT Integration Service
cd services/iot-integration-service
pip install -r requirements.txt
python main.py

# Blockchain Service
cd services/blockchain-service
pip install -r requirements.txt
python main.py

# Autonomous Delivery Service
cd services/autonomous-delivery-service
pip install -r requirements.txt
python main.py
```

### Option 3: Using Docker Compose

```bash
# Start all Phase 4 services
docker-compose up computer-vision-service iot-integration-service blockchain-service autonomous-delivery-service

# Or start specific services
docker-compose up computer-vision-service
```

## 🧪 Testing Services

### Health Checks

```bash
# Check all services
curl http://localhost:8004/health  # Computer Vision
curl http://localhost:8005/health  # IoT Integration
curl http://localhost:8006/health  # Blockchain
curl http://localhost:8007/health  # Autonomous Delivery
```

### Interactive API Documentation

Each service provides Swagger UI documentation:

- Computer Vision: http://localhost:8004/docs
- IoT Integration: http://localhost:8005/docs
- Blockchain: http://localhost:8006/docs
- Autonomous Delivery: http://localhost:8007/docs

### Example API Calls

#### Computer Vision - Analyze Shelf Compliance
```bash
curl -X POST "http://localhost:8004/analyze/shelf-compliance?outlet_id=OUT001" \
  -H "Authorization: Bearer test-token" \
  -F "image=@shelf.jpg"
```

#### IoT - Record Temperature
```bash
curl -X POST "http://localhost:8005/readings/temperature" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "COOLER_001",
    "outlet_id": "OUT001",
    "temperature_celsius": 20.5,
    "humidity_percentage": 45.0,
    "is_within_range": true
  }'
```

#### Blockchain - Check Status
```bash
curl -X GET "http://localhost:8006/blockchain/status" \
  -H "Authorization: Bearer test-token"
```

#### Autonomous Delivery - Get Fleet Status
```bash
curl -X GET "http://localhost:8007/fleet/status" \
  -H "Authorization: Bearer test-token"
```

## 📊 Service Dependencies

```
computer-vision-service/
├── requirements.txt
│   ├── fastapi==0.109.0
│   ├── uvicorn==0.27.0
│   ├── pydantic==2.5.3
│   └── python-multipart==0.0.6
└── main.py

iot-integration-service/
├── requirements.txt
│   ├── fastapi==0.109.0
│   ├── uvicorn==0.27.0
│   ├── pydantic==2.5.3
│   └── websockets==12.0
└── main.py

blockchain-service/
├── requirements.txt
│   ├── fastapi==0.109.0
│   ├── uvicorn==0.27.0
│   └── pydantic==2.5.3
└── main.py

autonomous-delivery-service/
├── requirements.txt
│   ├── fastapi==0.109.0
│   ├── uvicorn==0.27.0
│   └── pydantic==2.5.3
└── main.py
```

## 🔒 Security

### Authentication
All services use Bearer token authentication:

```python
headers = {
    'Authorization': 'Bearer your-token-here'
}
```

### Data Protection
- IoT data encrypted in transit (TLS 1.3)
- Blockchain provides immutability
- Computer vision images processed locally
- No PII stored in Phase 4 services

## 🛠️ Configuration

### Environment Variables

```bash
# Computer Vision Service
export CV_MODEL_PATH=/models
export CV_CONFIDENCE_THRESHOLD=0.85

# IoT Service
export REDIS_URL=redis://localhost:6379
export IOT_WS_TIMEOUT=300

# Blockchain Service
export BLOCKCHAIN_DIFFICULTY=2
export BLOCKCHAIN_MINING_REWARD=1.0

# Autonomous Service
export AUTO_FLEET_SIZE=10
export AUTO_MAX_CONCURRENT_MISSIONS=50
```

## 📈 Performance Metrics

| Service | Response Time | Throughput | Uptime Target |
|---------|--------------|------------|---------------|
| Computer Vision | <2s per image | 100 req/min | 99.5% |
| IoT Integration | <100ms | 1000 readings/s | 99.5% |
| Blockchain | 2-5s per block | 50 tx/block | 99.9% |
| Autonomous | <1s routing | 50 missions | 99.5% |

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check if port is already in use
lsof -i :8004
lsof -i :8005
lsof -i :8006
lsof -i :8007

# Kill conflicting processes
pkill -f 'python main.py'

# Check logs
python main.py 2>&1 | tee service.log
```

### Import Errors

```bash
# Ensure dependencies are installed
pip install -r requirements.txt

# Upgrade pip
pip install --upgrade pip
```

### Connection Refused

```bash
# Check if service is running
curl http://localhost:8004/health

# Check firewall
sudo ufw allow 8004
sudo ufw allow 8005
sudo ufw allow 8006
sudo ufw allow 8007
```

## 📚 Documentation

- [Phase 4 Innovations Overview](../docs/PHASE4_INNOVATIONS.md)
- [Integration Examples](../docs/PHASE4_INTEGRATION_EXAMPLES.md)
- [Main README](../README.md)

## 🤝 Contributing

Phase 4 services are actively developed. Contributions welcome in:
- ML model improvements for computer vision
- IoT device driver integrations
- Blockchain consensus optimizations
- Autonomous navigation algorithms

## 📞 Support

For Phase 4 support:
- **Email**: phase4@brainsait.com
- **Documentation**: `/docs/phase4`
- **API Docs**: Swagger UI at each service
- **Issues**: GitHub Issues

---

**Built with ❤️ by BrainSAIT**  
**Empowering Saudi Arabia's Vision 2030**
