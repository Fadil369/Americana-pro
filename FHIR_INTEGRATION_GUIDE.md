# BrainSAIT FHIR Server Integration Guide

## 🎯 Overview

Complete local FHIR R4 server setup with BrainSAIT OID namespace integration.

**Base OID**: `1.3.6.1.4.1.61026`
- **Sudan**: `.1` (1.3.6.1.4.1.61026.1)
- **Saudi Arabia**: `.2` (1.3.6.1.4.1.61026.2)

## 📦 What's Included

### FHIR Server Components
- **HAPI FHIR Server** (R4) - Latest version
- **PostgreSQL 15** - Database with BrainSAIT OID registry
- **Redis** - Caching and real-time features
- **PgAdmin** (optional) - Database management UI

### Integration Components
- **Python FHIR Client** - BrainSAIT OID-aware client library
- **FastAPI Endpoints** - RESTful API integration
- **Testing Suite** - Comprehensive integration tests
- **Automation Scripts** - Start, stop, test, and validate

## 🚀 Quick Start

### Prerequisites
```bash
# Required
- Docker & Docker Compose
- Python 3.11+
- curl & jq (for testing)

# Optional
- PostgreSQL client
- Redis client
```

### Step 1: Start FHIR Server

```bash
# Navigate to FHIR server directory
cd fhir-server

# Copy environment file
cp .env.example .env

# Make scripts executable
chmod +x scripts/*.sh

# Start the FHIR server
./scripts/start-fhir-server.sh
```

**Expected Output**:
```
🚀 Starting BrainSAIT FHIR Server...
📦 Pulling latest Docker images...
🔨 Building containers...
🚀 Starting services...

✅ BrainSAIT FHIR Server is starting!

Services:
  - FHIR Server: http://localhost:8080/fhir
  - FHIR UI: http://localhost:8080
  - PostgreSQL: localhost:5432
  - Redis: localhost:6379

⏳ Waiting for FHIR server to be ready...
✅ FHIR Server is ready!

BrainSAIT OID Base: 1.3.6.1.4.1.61026
  - Sudan: .1
  - Saudi Arabia: .2

✅ Ready for integration!
```

### Step 2: Test FHIR Server

```bash
# Run comprehensive tests
./scripts/test-fhir-server.sh
```

**Expected**:
```
✅ Server Metadata PASSED
✅ Sudan Patient created: xyz123
   OID: 1.3.6.1.4.1.61026.1.1
✅ Saudi Patient created: abc456
   OID: 1.3.6.1.4.1.61026.2.1
✅ All tests passed!
```

### Step 3: Install Python Integration

```bash
# Navigate to integration directory
cd ../brainsait-integration

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Test Integration

```bash
# Run integration tests
cd tests
pytest test_fhir_integration.py -v
```

## 📖 Usage Examples

### Python Client

```python
from fhir.client import FHIRClient, Country

# Initialize client
client = FHIRClient(base_url="http://localhost:8080/fhir")

# Create Sudan patient
patient = client.create_patient(
    given_name="Ahmad",
    family_name="Hassan",
    birth_date="1990-01-15",
    gender="male",
    country=Country.SUDAN,
    national_id="SD123456789",
    arabic_given="أحمد",
    arabic_family="حسن"
)

print(f"Patient ID: {patient.id}")
print(f"OID: {patient.identifier[0]['system']}")
# Output: urn:oid:1.3.6.1.4.1.61026.1.1

# Create lab observation
observation = client.create_observation(
    patient_id=patient.id,
    code="2345-7",
    display="Glucose",
    value=95,
    unit="mg/dL",
    country=Country.SUDAN,
    reference_range_low=70,
    reference_range_high=100
)

# Search patients
patients = client.search_patients(
    identifier="SD123456789",
    country=Country.SUDAN
)
```

### FastAPI Integration

```python
from fastapi import FastAPI
from api.fhir_api import router

app = FastAPI(title="BrainSAIT FHIR API")
app.include_router(router)

# Run with: uvicorn main:app --reload
```

**API Endpoints**:
- `POST /api/v1/fhir/patients` - Create patient
- `GET /api/v1/fhir/patients/{id}` - Get patient
- `GET /api/v1/fhir/patients` - Search patients
- `POST /api/v1/fhir/observations` - Create observation
- `GET /api/v1/fhir/patients/{id}/observations` - Get patient observations
- `GET /api/v1/fhir/oid/{country}` - Get OID info for country
- `GET /api/v1/fhir/health` - Health check

### cURL Examples

```bash
# Create Sudan Patient
curl -X POST http://localhost:8080/fhir/Patient \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{
      "system": "urn:oid:1.3.6.1.4.1.61026.1.1",
      "value": "SD123456789"
    }],
    "name": [{
      "given": ["Ahmad"],
      "family": "Hassan"
    }],
    "gender": "male",
    "birthDate": "1990-01-15"
  }'

# Search by OID
curl "http://localhost:8080/fhir/Patient?identifier=urn:oid:1.3.6.1.4.1.61026.1.1|SD123456789"

# Get server metadata
curl http://localhost:8080/fhir/metadata
```

## 🗂️ File Structure

```
.
├── fhir-server/
│   ├── docker-compose.yml          # Docker services configuration
│   ├── .env.example                # Environment variables template
│   ├── config/                     # FHIR server configuration
│   ├── scripts/
│   │   ├── start-fhir-server.sh   # Start script
│   │   ├── test-fhir-server.sh    # Test script
│   │   └── init-db.sql            # Database initialization
│   └── data/                       # Persistent data
│
├── brainsait-integration/
│   ├── fhir/
│   │   └── client.py              # Python FHIR client
│   ├── api/
│   │   └── fhir_api.py            # FastAPI endpoints
│   ├── tests/
│   │   └── test_fhir_integration.py  # Integration tests
│   └── requirements.txt           # Python dependencies
│
└── FHIR_INTEGRATION_GUIDE.md      # This file
```

## 🔧 Configuration

### Environment Variables

```env
# FHIR Server
FHIR_SERVER_PORT=8080
FHIR_SERVER_BASE_URL=http://localhost:8080/fhir

# Database
POSTGRES_DB=fhir
POSTGRES_USER=fhiruser
POSTGRES_PASSWORD=fhirpass

# BrainSAIT OID
BRAINSAIT_OID_BASE=1.3.6.1.4.1.61026
BRAINSAIT_OID_SUDAN=1.3.6.1.4.1.61026.1
BRAINSAIT_OID_SAUDI=1.3.6.1.4.1.61026.2

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key
```

### Docker Services

**FHIR Server**: `http://localhost:8080`
- Web UI: `http://localhost:8080`
- FHIR API: `http://localhost:8080/fhir`
- Metadata: `http://localhost:8080/fhir/metadata`

**PostgreSQL**: `localhost:5432`
- Database: `fhir`
- User: `fhiruser`
- Password: `fhirpass`

**Redis**: `localhost:6379`

**PgAdmin** (optional): `http://localhost:5050`
- Email: `admin@brainsait.com`
- Password: `admin`

## 🧪 Testing

### Run All Tests

```bash
# FHIR server tests
cd fhir-server
./scripts/test-fhir-server.sh

# Integration tests
cd ../brainsait-integration
pytest tests/ -v

# With coverage
pytest tests/ --cov=fhir --cov=api --cov-report=html
```

### Manual Testing

```bash
# Check server health
curl http://localhost:8080/fhir/metadata

# Create test patient
curl -X POST http://localhost:8080/fhir/Patient \
  -H "Content-Type: application/fhir+json" \
  -d @test-patient.json

# Search patients
curl "http://localhost:8080/fhir/Patient?name=Ahmad"
```

## 📊 Database Schema

### BrainSAIT OID Registry

```sql
SELECT * FROM brainsait.oid_registry;

 id |         oid          | country_code | resource_type |      description
----+----------------------+--------------+---------------+------------------------
  1 | 1.3.6.1.4.1.61026.1.1 | SD          | Patient       | Sudan Patient Identifiers
  2 | 1.3.6.1.4.1.61026.1.2 | SD          | Practitioner  | Sudan Practitioner Identifiers
  3 | 1.3.6.1.4.1.61026.2.1 | SA          | Patient       | Saudi Arabia Patient Identifiers
  4 | 1.3.6.1.4.1.61026.2.2 | SA          | Practitioner  | Saudi Arabia Practitioner Identifiers
```

### Audit Logs

```sql
SELECT * FROM brainsait.audit_log LIMIT 10;
```

## 🔍 Troubleshooting

### FHIR Server Won't Start

```bash
# Check Docker logs
docker-compose logs fhir-server

# Restart services
docker-compose down
docker-compose up -d

# Check database
docker-compose logs fhir-db
```

### Connection Refused

```bash
# Verify services are running
docker-compose ps

# Check ports
netstat -an | grep 8080
netstat -an | grep 5432

# Test connectivity
curl http://localhost:8080/fhir/metadata
```

### OID Not Being Used

```bash
# Check database OID registry
docker-compose exec fhir-db psql -U fhiruser -d fhir \
  -c "SELECT * FROM brainsait.oid_registry;"

# Verify patient identifiers
curl "http://localhost:8080/fhir/Patient/123" | jq '.identifier'
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Enable HTTPS/TLS
- [ ] Configure authentication (OAuth2/OIDC)
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Implement rate limiting
- [ ] Set resource quotas
- [ ] Enable monitoring/alerts

### Performance Tuning

```yaml
# docker-compose.yml
environment:
  JAVA_OPTS: "-Xms2g -Xmx8g"  # Increase heap size
  hapi.fhir.reuse_cached_search_results_millis: 300000  # 5 min cache
```

### Backup Strategy

```bash
# Backup database
docker-compose exec fhir-db pg_dump -U fhiruser fhir > backup.sql

# Backup volumes
docker run --rm -v fhir-db-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/fhir-data-backup.tar.gz /data
```

## 📚 Additional Resources

- **FHIR R4 Spec**: https://hl7.org/fhir/R4/
- **HAPI FHIR**: https://hapifhir.io/
- **BrainSAIT OID**: https://oid-base.com/get/1.3.6.1.4.1.61026
- **NPHIES**: https://nphies.sa/
- **Python FHIR**: https://pypi.org/project/fhir.resources/

## 🆘 Support

- **Issues**: Create GitHub issue with label `fhir-integration`
- **Documentation**: See `docs/` directory
- **Logs**: `docker-compose logs -f`

---

**BrainSAIT OID**: `1.3.6.1.4.1.61026`
**FHIR Version**: R4 (4.0.1)
**Last Updated**: 2025-10-02
