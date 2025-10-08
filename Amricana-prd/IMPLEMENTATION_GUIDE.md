# SSDP Implementation Guide

This guide provides step-by-step instructions for implementing and deploying the Smart Sweet Distribution Platform (SSDP).

## Table of Contents

1. [Quick Start](#quick-start)
2. [Service-by-Service Setup](#service-by-service-setup)
3. [Worker Deployment](#worker-deployment)
4. [Package Integration](#package-integration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

```bash
# Required software
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- Wrangler CLI (for Cloudflare Workers)
- PostgreSQL 14+
- Redis 7+

# Install Wrangler
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Fadil369/Americana-pro.git
cd Americana-pro/Amricana-prd

# Install root dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
npm run dev:all
```

## Service-by-Service Setup

### 1. Distribution Service (Port 8000)

```bash
cd services/distribution-service

# Install Python dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

**Configuration:**
- Update Redis connection in `main.py`
- Configure database connection
- Set up product catalog

**Test:**
```bash
curl http://localhost:8000/
curl http://localhost:8000/orders
```

### 2. AI Forecasting Service (Port 8001)

```bash
cd services/ai-forecasting-service

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

**Features:**
- Demand forecasting with Ramadan/Eid detection
- Dynamic pricing optimization
- Customer churn prediction
- Inventory orchestration

**Test:**
```bash
# Test demand forecast
curl "http://localhost:8001/forecast/demand?days_ahead=30&region=Riyadh"

# Test dynamic pricing
curl "http://localhost:8001/pricing/optimize?product_id=PRD001&current_inventory=100&demand_forecast=1500"

# Test churn prediction
curl "http://localhost:8001/churn/predict?outlet_id=OUT001&days_since_last_order=45&average_order_value=2500&order_frequency=2"
```

### 3. Sales Service (Port 8002)

```bash
cd services/sales-service

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

**Features:**
- Sales rep management
- Outlet visit tracking (check-in/check-out with geolocation)
- Performance analytics & leaderboards
- Daily route planning
- Audit logging

**Test:**
```bash
# Create sales rep (requires Bearer token)
curl -X POST http://localhost:8002/sales-reps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Al-Rashid",
    "name_ar": "أحمد الراشد",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "territory": "Riyadh",
    "sales_target": 50000.0
  }'

# Get leaderboard
curl http://localhost:8002/leaderboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Finance Service (Port 8003)

```bash
cd services/finance-service

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

**Features:**
- ZATCA Phase 2 e-invoicing
- QR code generation (TLV format)
- Multi-payment gateway support
- Credit limit management
- VAT reporting

**Test:**
```bash
# Create ZATCA invoice
curl -X POST http://localhost:8003/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV001",
    "outlet_id": "OUT001",
    "outlet_name": "Al-Noor Sweets",
    "outlet_name_ar": "حلويات النور",
    "line_items": [
      {
        "product_id": "PRD001",
        "product_name": "Baklava",
        "product_name_ar": "بقلاوة",
        "quantity": 10,
        "unit_price": 25.0,
        "discount": 0,
        "tax_rate": 0.15
      }
    ]
  }'

# Get VAT report
curl "http://localhost:8003/analytics/vat-report?from_date=2024-01-01&to_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Saudi API Service (Port 8004)

```bash
cd services/saudi-api-service

# Install dependencies
pip install -r requirements.txt

# Configure Wathq API credentials
export WATHQ_API_KEY="your_api_key"

# Run the service
python main.py
```

**Test:**
```bash
# Verify outlet with CR number
curl http://localhost:8004/national-address/1234567890
```

## Worker Deployment

### Invoice Generator Worker

```bash
cd workers/invoice-generator-worker

# Install dependencies
npm install

# Set up secrets
wrangler secret put ZATCA_API_KEY

# Deploy to Cloudflare
wrangler deploy

# Test locally
wrangler dev
```

**Test:**
```bash
# Generate invoice
curl -X POST https://ssdp-invoice-generator.YOUR_SUBDOMAIN.workers.dev/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "outlet_id": "OUT001",
    "outlet_name": "Al-Noor Sweets",
    "outlet_name_ar": "حلويات النور",
    "line_items": [
      {
        "product_id": "PRD001",
        "product_name": "Baklava",
        "product_name_ar": "بقلاوة",
        "quantity": 10,
        "unit_price": 25.0,
        "discount": 0,
        "tax_rate": 0.15
      }
    ]
  }'
```

### Analytics Aggregator Worker

```bash
cd workers/analytics-aggregator-worker

# Install dependencies
npm install

# Create KV namespace
wrangler kv:namespace create "SSDP_KV"
wrangler kv:namespace create "SSDP_KV" --preview

# Update wrangler.toml with KV namespace IDs

# Deploy
wrangler deploy
```

**Test:**
```bash
# Get dashboard analytics
curl https://ssdp-analytics-aggregator.YOUR_SUBDOMAIN.workers.dev/analytics/dashboard?period=month

# Get sales metrics
curl https://ssdp-analytics-aggregator.YOUR_SUBDOMAIN.workers.dev/analytics/sales?period=week
```

## Package Integration

### Audit Logger (Python)

```python
from packages.audit_logger.src.index import (
    get_audit_logger,
    get_permission_guard,
    AuditAction,
    ResourceType,
    SeverityLevel
)

# Initialize logger
audit_logger = get_audit_logger()

# Log data access
audit_logger.log_data_access(
    user_id="user123",
    resource_type=ResourceType.OUTLET,
    resource_id="OUT001",
    fields_accessed=["name", "credit_limit"],
    ip_address="192.168.1.1"
)

# Check permissions
permission_guard = get_permission_guard()
has_access = permission_guard.check_access(
    user_id="user123",
    user_role="sales_rep",
    action="read",
    resource_type=ResourceType.OUTLET,
    resource_id="OUT001"
)

# Export audit logs
logs_json = audit_logger.export_logs(
    from_date=datetime(2024, 1, 1),
    to_date=datetime(2024, 12, 31),
    format="json"
)
```

### Bilingual Utils (TypeScript)

```typescript
import {
  formatCurrency,
  formatDate,
  getText,
  getRTLSpacing,
  isRTL,
  toHijri,
  formatHijriDate,
  isRamadan,
  isEid,
  productCategories,
  orderStatuses
} from '@ssdp/bilingual-utils';

// Format currency
const price = formatCurrency(1250.50, 'ar'); // "١٬٢٥٠٫٥٠ ر.س."

// Format date
const date = formatDate(new Date(), 'ar'); // "١٥ يناير ٢٠٢٤"

// Get RTL spacing
const isArabic = true;
const spacing = getRTLSpacing(isArabic);
// spacing.textAlign = 'right'

// Hijri calendar
const hijriDate = toHijri(new Date());
const hijriFormatted = formatHijriDate(hijriDate, 'ar');
// "١٥ رمضان ١٤٤٥ هـ"

// Check cultural events
if (isRamadan(new Date())) {
  console.log("Special Ramadan pricing applies");
}

// Bilingual text
const category = getText(productCategories.baklava, 'ar'); // "بقلاوة"
const status = getText(orderStatuses.delivered, 'en'); // "Delivered"
```

## Testing

### Unit Tests

```bash
# Python services
cd services/sales-service
pytest

# TypeScript workers
cd workers/invoice-generator-worker
npm test
```

### Integration Tests

```bash
# Test complete workflow
./scripts/test-integration.sh
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8001/forecast/demand

# Using k6
k6 run load-tests/demand-forecast.js
```

## Production Deployment

### Docker Deployment

```bash
# Build and deploy all services
docker-compose -f docker-compose.prod.yml up -d

# Check service health
docker-compose ps
docker-compose logs -f
```

### Cloudflare Workers

```bash
# Deploy all workers
cd workers
./deploy-all.sh

# Or deploy individually
cd invoice-generator-worker && wrangler deploy
cd ../analytics-aggregator-worker && wrangler deploy
```

### Environment Variables

Create production `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/ssdp_prod
REDIS_URL=redis://host:6379

# ZATCA
ZATCA_API_KEY=your_production_api_key
ZATCA_API_URL=https://api.zatca.gov.sa

# Wathq
WATHQ_API_KEY=your_wathq_api_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Database Migration

```bash
# Run migrations
python scripts/migrate.py

# Seed initial data
python scripts/seed.py
```

### Monitoring Setup

```bash
# Set up Prometheus
docker-compose -f monitoring/docker-compose.yml up -d

# Access Grafana
open http://localhost:3000
```

## Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check port availability
lsof -i :8000

# Restart service
docker-compose restart service-name
```

#### Worker Deployment Fails

```bash
# Check wrangler version
wrangler --version

# Update wrangler
npm install -g wrangler@latest

# Check Cloudflare account status
wrangler whoami

# View worker logs
wrangler tail worker-name
```

#### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U ssdp_user -d ssdp_db

# Test Redis connection
redis-cli ping

# Check connection pool
docker-compose exec postgres psql -U ssdp_user -d ssdp_db -c "SELECT * FROM pg_stat_activity;"
```

#### ZATCA API Errors

```bash
# Test ZATCA connectivity
curl -H "Authorization: Bearer $ZATCA_API_KEY" https://api.zatca.gov.sa/health

# Validate invoice format
python scripts/validate_zatca_invoice.py invoice.xml

# Check QR code
python scripts/decode_qr.py "base64_qr_code"
```

### Performance Optimization

#### Caching Strategy

```python
# Redis caching for frequent queries
import redis
redis_client = redis.Redis(host='localhost', port=6379)

# Cache forecast for 5 minutes
cache_key = f"forecast:{region}:{days_ahead}"
cached = redis_client.get(cache_key)
if cached:
    return json.loads(cached)

# Generate forecast
forecast = generate_forecast(region, days_ahead)
redis_client.setex(cache_key, 300, json.dumps(forecast))
```

#### Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_visits_sales_rep_id ON visits(sales_rep_id);
```

### Security Best Practices

1. **API Keys**: Use environment variables, never commit
2. **JWT Tokens**: Short expiration (1 hour), refresh tokens
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **HTTPS Only**: Force HTTPS in production
5. **Audit Logging**: Log all sensitive data access
6. **Input Validation**: Validate all user inputs
7. **SQL Injection**: Use parameterized queries
8. **CORS**: Restrict CORS to known domains

## Support

### Documentation
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- API Reference: http://localhost:8000/docs
- BrainSAIT Copilot: [.github/copilot-instructions.md](../.github/copilot-instructions.md)

### Contact
- Email: info@brainsait.com
- GitHub Issues: https://github.com/Fadil369/Americana-pro/issues
- Slack: #ssdp-platform

---

**Note**: This is a living document. Keep it updated as the platform evolves.
