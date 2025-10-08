# SSDP Platform Architecture

This document details the complete architecture of the Smart Sweet Distribution Platform (SSDP), including all services, workers, and packages.

## Overview

SSDP is built on a microservices architecture with edge computing capabilities, designed specifically for the Saudi Arabian sweet distribution market.

## Architecture Components

### 1. Services (FastAPI/Python)

#### Distribution Service (`services/distribution-service/`)
- **Port**: 8000
- **Features**:
  - Order management
  - Outlet management
  - Product catalog
  - Vehicle tracking
- **Dependencies**: Redis, PostgreSQL

#### AI Forecasting Service (`services/ai-forecasting-service/`)
- **Port**: 8001
- **Features**:
  - Demand forecasting with Ramadan/Eid detection
  - Dynamic pricing optimization
  - Customer churn prediction
  - Inventory orchestration
  - Predictive restocking recommendations
- **ML Models**: Random Forest, scikit-learn
- **Cultural Integration**: Hijri calendar awareness

#### Sales Service (`services/sales-service/`)
- **Port**: 8002
- **Features**:
  - Sales rep management
  - Outlet visit tracking (check-in/check-out)
  - Performance analytics
  - Leaderboard & gamification
  - Daily route planning
  - Commission calculation
- **Security**: RBAC, Audit logging

#### Finance Service (`services/finance-service/`)
- **Port**: 8003
- **Features**:
  - ZATCA Phase 2 e-invoicing
  - QR code generation (TLV format)
  - Multi-payment gateway support (Mada, STC Pay, Urpay, Apple Pay)
  - Credit limit management
  - VAT calculation & reporting
  - Financial analytics
- **Compliance**: ZATCA-compliant, 15% VAT

#### Saudi API Service (`services/saudi-api-service/`)
- **Port**: 8004
- **Features**:
  - Wathq API integration
  - National address verification
  - Commercial registration validation

### 2. Cloudflare Workers (TypeScript)

#### Invoice Generator Worker (`workers/invoice-generator-worker/`)
- **Features**:
  - ZATCA-compliant invoice generation
  - QR code generation (Base64 TLV encoding)
  - XML invoice format (UBL 2.1)
  - Invoice caching in KV
- **Edge Computing**: Low-latency invoice generation
- **Storage**: Cloudflare KV

#### Analytics Aggregator Worker (`workers/analytics-aggregator-worker/`)
- **Features**:
  - Real-time dashboard analytics
  - Sales metrics aggregation
  - Regional performance tracking
  - Product performance analysis
  - Sales rep leaderboards
  - Trend analysis
- **Caching**: 5-minute cache in KV
- **Storage**: Cloudflare KV, R2 (report exports)

#### Payment Processor Worker (`workers/payment-processor-worker/`)
- **Features**: Payment gateway integration
- **Gateways**: Mada, STC Pay, Urpay, Apple Pay, HyperPay

#### Route Optimizer Worker (`workers/route-optimizer-worker/`)
- **Features**:
  - AI-powered route optimization
  - Traffic integration
  - Multi-constraint optimization
  - Real-time re-routing

### 3. Packages (Shared Libraries)

#### Audit Logger (`packages/audit-logger/`)
- **Language**: Python
- **Features**:
  - Comprehensive audit logging
  - HIPAA compliance
  - Role-based access control (PermissionGuard)
  - Checksum verification
  - Audit trail export
- **Classes**:
  - `AuditLogger`: Main logging service
  - `PermissionGuard`: RBAC enforcement
  - `AuditLog`: Log entry model

#### Bilingual Utils (`packages/bilingual-utils/`)
- **Language**: TypeScript
- **Features**:
  - Arabic/English support
  - RTL/LTR layout utilities
  - Hijri calendar conversion
  - Number formatting (Arabic/English numerals)
  - Currency formatting (SAR)
  - Date/time formatting
  - Phone number formatting (Saudi format)
  - Cultural greetings
  - Ramadan/Eid detection
  - Saudi weekend detection (Fri/Sat)
- **Types**:
  - `BilingualText`: Dual-language text object
  - `RTLSpacing`: RTL-aware spacing utilities
  - `HijriDate`: Hijri calendar date

#### Saudi Compliance (`packages/saudi-compliance/`)
- **Language**: TypeScript
- **Features**:
  - ZATCA e-invoicing
  - VAT calculation (15%)
  - QR code generation
  - XML invoice generation

#### UI Components (`packages/ui-components/`)
- **Language**: React/TypeScript
- **Features**:
  - Glass morphism design system
  - Mesh gradient backgrounds
  - Bilingual components
  - RTL-aware layouts

## Service Communication

```
┌─────────────────┐
│   Web Dashboard │
│   (Next.js)     │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌────────────────┐  ┌──────────────────┐
│ Cloudflare     │  │ FastAPI Services │
│ Workers (Edge) │  │  (Backend)       │
└────────┬───────┘  └────────┬─────────┘
         │                   │
         └───────┬───────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
┌────────────┐    ┌───────────────┐
│ PostgreSQL │    │ Redis Cache   │
└────────────┘    └───────────────┘
```

## API Endpoints Summary

### Distribution Service (Port 8000)
- `GET /` - Service info
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /outlets` - List outlets
- `POST /outlets` - Register outlet

### AI Forecasting Service (Port 8001)
- `GET /` - Service info
- `GET /forecast/demand` - Demand forecast
- `GET /forecast/products` - Product-specific forecast
- `GET /pricing/optimize` - Dynamic pricing
- `GET /churn/predict` - Churn prediction
- `POST /inventory/restock-recommendations` - Restock recommendations

### Sales Service (Port 8002)
- `GET /` - Service info
- `GET /sales-reps` - List sales reps
- `POST /sales-reps` - Create sales rep
- `POST /visits/check-in` - Check-in to outlet
- `POST /visits/{id}/check-out` - Check-out from outlet
- `GET /performance/{rep_id}` - Performance metrics
- `GET /leaderboard` - Sales leaderboard
- `GET /audit-logs` - Audit trail

### Finance Service (Port 8003)
- `GET /` - Service info
- `POST /invoices` - Create ZATCA invoice
- `GET /invoices` - List invoices
- `POST /invoices/{id}/submit-zatca` - Submit to ZATCA
- `GET /invoices/{id}/qr-code` - Get QR code
- `POST /payments` - Process payment
- `GET /credit-limits/{outlet_id}` - Credit limit info
- `POST /credit-limits/{outlet_id}/check` - Credit approval
- `GET /analytics/summary` - Financial summary
- `GET /analytics/vat-report` - VAT report

### Invoice Generator Worker
- `POST /generate-invoice` - Generate ZATCA invoice
- `GET /invoice/{number}` - Retrieve invoice
- `GET /health` - Health check

### Analytics Aggregator Worker
- `GET /analytics/dashboard` - Dashboard analytics
- `GET /analytics/sales` - Sales metrics
- `GET /analytics/regions` - Regional performance
- `GET /analytics/products` - Product performance
- `GET /analytics/performance` - Sales rep performance
- `GET /analytics/trends` - Sales trends
- `POST /analytics/export` - Export report

## Security & Compliance

### Audit Logging
All services implement comprehensive audit logging using the `audit-logger` package:
- User actions tracked
- Data access logged
- Modification history
- Security events
- Checksum verification

### Role-Based Access Control
The `PermissionGuard` class enforces RBAC:
- **super_admin**: Full access
- **regional_manager**: Territory management
- **sales_rep**: Field operations
- **driver**: Delivery management
- **finance_officer**: Financial operations
- **outlet_owner**: Self-service portal

### ZATCA Compliance
All invoicing follows ZATCA Phase 2 requirements:
- TLV-encoded QR codes
- XML invoice format (UBL 2.1)
- Cryptographic hash
- UUID tracking
- 15% VAT calculation

## Deployment

### Services (Docker)
```bash
cd Amricana-prd
docker-compose up -d
```

### Workers (Cloudflare)
```bash
cd workers/invoice-generator-worker
npm install
wrangler deploy

cd ../analytics-aggregator-worker
npm install
wrangler deploy
```

### Environment Variables

#### Services
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `ZATCA_API_KEY`: ZATCA API key

#### Workers
- `ZATCA_API_KEY`: ZATCA API key (secret)
- `ZATCA_API_URL`: ZATCA API endpoint

## Monitoring

### Metrics
- Request latency
- Error rates
- Cache hit rates
- Database connection pool
- API response times

### Logging
- Structured JSON logs
- Audit trail
- Error tracking
- Performance metrics

## Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- Wrangler CLI

### Local Development
```bash
# Install dependencies
npm run setup

# Start all services
npm run dev:all

# Start individual services
npm run dev:web       # Next.js dashboard
npm run dev:mobile    # React Native app
npm run dev:services  # Docker services
```

## Future Enhancements

### Phase 4 (Months 10-12)
- [ ] Computer vision for product recognition
- [ ] IoT device integration (temperature sensors)
- [ ] Blockchain traceability pilot
- [ ] Autonomous delivery planning
- [ ] Advanced ML models (LSTM, Transformer)
- [ ] Multi-region replication

## Support

For questions or issues:
- Email: info@brainsait.com
- Documentation: `/docs`
- API Reference: `/api/docs`

---

Built with ❤️ by BrainSAIT for Saudi Arabia's sweet distribution industry.
