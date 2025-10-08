# 🏥 BrainSAIT FHIR Server - Complete Setup

## 🎉 What You Got

**Local FHIR R4 Server** with BrainSAIT OID namespace integration:
- ✅ HAPI FHIR Server (latest)
- ✅ PostgreSQL database with OID registry
- ✅ Redis for caching
- ✅ Python integration library
- ✅ FastAPI endpoints
- ✅ Comprehensive testing suite
- ✅ Automation scripts

**BrainSAIT OID**: `1.3.6.1.4.1.61026`
- Sudan: `.1`
- Saudi Arabia: `.2`

## 🚀 Quick Start (3 Steps)

### 1. Start FHIR Server

```bash
cd fhir-server
./scripts/start-fhir-server.sh
```

**Wait for**: `✅ FHIR Server is ready!`

### 2. Test It Works

```bash
./scripts/test-fhir-server.sh
```

**Expected**: All tests pass ✅

### 3. Use It

```bash
# Open FHIR UI
open http://localhost:8080

# Check metadata
curl http://localhost:8080/fhir/metadata
```

## 📁 File Structure

```
.
├── fhir-server/                 # FHIR server setup
│   ├── docker-compose.yml       # Docker configuration
│   ├── .env.example            # Environment template
│   └── scripts/
│       ├── start-fhir-server.sh ← Start here!
│       ├── test-fhir-server.sh  ← Test here!
│       └── init-db.sql         # Database setup
│
├── brainsait-integration/       # Python integration
│   ├── fhir/client.py          # FHIR client library
│   ├── api/fhir_api.py         # FastAPI endpoints
│   ├── tests/                  # Integration tests
│   └── requirements.txt        # Python dependencies
│
├── FHIR_INTEGRATION_GUIDE.md   ← Full documentation
└── README-FHIR.md              ← This file
```

## 💻 Usage Examples

### Python

```python
from fhir.client import FHIRClient, Country

client = FHIRClient()

# Create Sudan patient
patient = client.create_patient(
    given_name="Ahmad",
    family_name="Hassan",
    birth_date="1990-01-15",
    gender="male",
    country=Country.SUDAN,
    national_id="SD123456789"
)

print(f"Created: {patient.id}")
# Uses OID: 1.3.6.1.4.1.61026.1.1
```

### cURL

```bash
# Create patient
curl -X POST http://localhost:8080/fhir/Patient \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{
      "system": "urn:oid:1.3.6.1.4.1.61026.1.1",
      "value": "SD123456"
    }],
    "name": [{"given": ["Ahmad"], "family": "Hassan"}],
    "gender": "male",
    "birthDate": "1990-01-15"
  }'

# Search patients
curl "http://localhost:8080/fhir/Patient?identifier=urn:oid:1.3.6.1.4.1.61026.1.1|SD123456"
```

## 🔗 Endpoints

**FHIR Server**:
- Web UI: http://localhost:8080
- API: http://localhost:8080/fhir
- Metadata: http://localhost:8080/fhir/metadata

**Database**:
- PostgreSQL: localhost:5432
- User: `fhiruser`
- Password: `fhirpass`
- Database: `fhir`

**Optional**:
- PgAdmin: http://localhost:5050 (admin@brainsait.com / admin)
- Redis: localhost:6379

## 🧪 Testing

```bash
# Test FHIR server
cd fhir-server
./scripts/test-fhir-server.sh

# Test Python integration
cd brainsait-integration
pip install -r requirements.txt
pytest tests/ -v
```

## 🛑 Stop/Start

```bash
# Stop
cd fhir-server
docker-compose down

# Start
docker-compose up -d

# View logs
docker-compose logs -f fhir-server
```

## 📖 Full Documentation

See **FHIR_INTEGRATION_GUIDE.md** for:
- Detailed setup instructions
- API documentation
- Advanced usage examples
- Production deployment
- Troubleshooting

## ✅ What's Working

- [x] FHIR R4 server running
- [x] BrainSAIT OID namespace (1.3.6.1.4.1.61026)
- [x] Sudan branch (.1) for Sudan patients/resources
- [x] Saudi Arabia branch (.2) for KSA patients/resources
- [x] PostgreSQL with OID registry
- [x] Python FHIR client library
- [x] FastAPI integration endpoints
- [x] Automated testing
- [x] Bilingual support (Arabic/English)
- [x] HIPAA-compliant audit logging

## 🆘 Quick Troubleshooting

**Server won't start?**
```bash
docker-compose logs fhir-server
docker-compose down && docker-compose up -d
```

**Can't connect?**
```bash
curl http://localhost:8080/fhir/metadata
docker-compose ps
```

**Tests failing?**
```bash
# Make sure server is running first
docker-compose ps
./scripts/test-fhir-server.sh
```

## 🎯 Next Steps

1. ✅ Start server: `./fhir-server/scripts/start-fhir-server.sh`
2. ✅ Test it: `./fhir-server/scripts/test-fhir-server.sh`
3. 📖 Read: `FHIR_INTEGRATION_GUIDE.md`
4. 🔧 Integrate: Use Python client or FastAPI endpoints
5. 🚀 Deploy: See production checklist in guide

---

**BrainSAIT OID**: `1.3.6.1.4.1.61026`
**Reference**: https://oid-base.com/get/1.3.6.1.4.1.61026
**Created**: 2025-10-02
