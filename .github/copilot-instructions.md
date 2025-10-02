# BrainSAIT GitHub Copilot Instructions

## Project Overview

BrainSAIT is an enterprise healthcare platform designed for Saudi Arabia and Sudan, providing HIPAA and NPHIES-compliant patient data management, clinical workflows, and healthcare analytics.

**Mission**: Deliver world-class healthcare technology that seamlessly integrates with Saudi healthcare infrastructure while maintaining the highest standards of security, compliance, and user experience.

**OID System Root**: `1.3.6.1.4.1.61026`
- Base: `1.3.6.1.4.1.61026` (BrainSAIT)
- Sudan Branch: `1.3.6.1.4.1.61026.1`
- Saudi Arabia Branch: `1.3.6.1.4.1.61026.2`
- Reference: https://oid-base.com/get/1.3.6.1.4.1.61026

## Technology Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+ with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- i18next for bilingual support (Arabic/English)
- @paper-design/shaders-react for mesh gradients

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL with encrypted PHI fields
- Redis for caching and real-time features
- FHIR R4 resources (fhir.resources library)
- JWT authentication with role-based access control

**Infrastructure:**
- Docker & Docker Compose
- AWS (production)
- GitHub Actions for CI/CD
- Prometheus & Grafana for monitoring

## Core Principles

### 1. Security & Compliance First
- **HIPAA Compliance**: All PHI must be encrypted at rest and in transit
- **NPHIES Integration**: Follow Saudi NPHIES standards for all clinical data
- **Audit Logging**: Log every access to patient data with user ID, timestamp, and action
- **Role-Based Access**: Implement strict RBAC for all endpoints and components

### 2. Bilingual by Design
- **Arabic & English**: All UI components must support both languages
- **RTL/LTR Layouts**: Automatically adapt layout direction based on language
- **Medical Terminology**: Use NPHIES-approved Arabic medical terms
- **Cultural Sensitivity**: Consider Saudi cultural context in all UX decisions

### 3. FHIR R4 Compliance
- **Standard Resources**: Use FHIR R4 resources for all clinical data
- **Validation**: Validate all FHIR resources against R4 schema
- **Interoperability**: Design for easy integration with other healthcare systems
- **BrainSAIT OID System**: Use `1.3.6.1.4.1.61026` as the base OID for all identifiers

### 4. Glass Morphism Design System
- **BrainSAIT Colors**: Use the official color palette (midnight blue, medical blue, signal teal, deep orange)
- **Mesh Gradients**: Implement animated mesh gradients for backgrounds
- **Glass Cards**: Use glass morphism for all card components
- **Professional Aesthetic**: Maintain clean, medical-grade visual design

## OID Naming System

BrainSAIT uses a registered OID namespace for all healthcare identifiers:

```
Base OID: 1.3.6.1.4.1.61026

Country Branches:
├── 1.3.6.1.4.1.61026.1          # Sudan
│   ├── 1.3.6.1.4.1.61026.1.1    # Patients
│   ├── 1.3.6.1.4.1.61026.1.2    # Providers
│   ├── 1.3.6.1.4.1.61026.1.3    # Organizations
│   └── 1.3.6.1.4.1.61026.1.4    # Facilities
│
└── 1.3.6.1.4.1.61026.2          # Saudi Arabia
    ├── 1.3.6.1.4.1.61026.2.1    # Patients
    ├── 1.3.6.1.4.1.61026.2.2    # Providers
    ├── 1.3.6.1.4.1.61026.2.3    # Organizations
    └── 1.3.6.1.4.1.61026.2.4    # Facilities
```

### Example Usage in FHIR:

```python
# Sudan patient identifier
patient.identifier = [{
    "system": "urn:oid:1.3.6.1.4.1.61026.1.1",
    "value": "SD123456789",
    "type": {
        "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MR",
            "display": "Medical Record Number"
        }]
    }
}]

# Saudi patient identifier
patient.identifier = [{
    "system": "urn:oid:1.3.6.1.4.1.61026.2.1",
    "value": "SA987654321",
    "type": {
        "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "NI",
            "display": "National Identifier"
        }]
    }
}]
```

## Naming Conventions

### Files & Directories
```
PascalCase: React components (PatientCard.tsx)
kebab-case: Utility files (auth-utils.ts)
snake_case: Python files (patient_service.py)
SCREAMING_SNAKE_CASE: Constants (API_BASE_URL)
```

### Functions & Variables
```python
# Python
snake_case: Functions and variables (create_patient, user_id)
PascalCase: Classes (PatientService, FHIRValidator)

# TypeScript/React
camelCase: Functions and variables (createPatient, userId)
PascalCase: Components and Types (PatientCard, UserRole)
```

### Database Tables
```
snake_case: Table names (patients, clinical_observations)
Prefix PHI tables: phi_patients, phi_observations
Use UUID primary keys: id (UUID v4)
```

## Code Comment Tags

Use these tags to categorize code sections:

- **MEDICAL**: Code handling clinical/medical data
- **BRAINSAIT**: BrainSAIT-specific business logic
- **NEURAL**: UI/UX components and design system
- **BILINGUAL**: Translation and localization logic
- **AGENT**: AI agent-related code
- **HIPAA**: HIPAA compliance-related code
- **NPHIES**: NPHIES integration code
- **TODO**: Work in progress or future enhancements
- **FIXME**: Known issues that need fixing
- **SECURITY**: Security-critical code sections

Example:
```python
# MEDICAL: Create FHIR R4 compliant patient resource
# BRAINSAIT: Uses BrainSAIT OID namespace 1.3.6.1.4.1.61026
# HIPAA: Ensure all PHI fields are encrypted before storage
def create_patient_resource(patient_data: dict, country: str = "SD") -> Patient:
    # Implementation
    pass
```

## Security & Compliance

### Mandatory Security Practices

1. **Never log sensitive data**:
   ```python
   # ❌ BAD
   logger.info(f"Patient data: {patient}")

   # ✅ GOOD
   logger.info(f"Patient created: {patient.id}")
   ```

2. **Always encrypt PHI**:
   ```python
   # HIPAA: Encrypt before database storage
   encrypted_national_id = encrypt_phi(patient.national_id)
   ```

3. **Validate all inputs**:
   ```python
   from pydantic import BaseModel, validator

   class PatientInput(BaseModel):
       name: str

       @validator('name')
       def validate_name(cls, v):
           if not v or len(v) < 2:
               raise ValueError('Invalid name')
           return v
   ```

4. **Use parameterized queries** (prevent SQL injection):
   ```python
   # ❌ BAD
   query = f"SELECT * FROM patients WHERE id = '{patient_id}'"

   # ✅ GOOD
   query = "SELECT * FROM patients WHERE id = :patient_id"
   result = await db.execute(query, {"patient_id": patient_id})
   ```

### Audit Logging Requirements

Every function that accesses PHI MUST log the access:

```python
from brainsait.audit import audit_logger

@audit_phi_access
async def get_patient_record(patient_id: str, user_id: str):
    """MEDICAL: Retrieve patient record with audit trail"""
    audit_logger.log_phi_access(
        patient_id=patient_id,
        user_id=user_id,
        action='read',
        timestamp=datetime.utcnow()
    )

    patient = await fetch_patient(patient_id)
    return patient
```

## UI/UX Standards

### Component Structure

Every React component should follow this pattern:

```typescript
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '@/components/ui/GlassCard';

interface ComponentProps {
  // Props definition
}

export const ComponentName: FC<ComponentProps> = ({ ...props }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Component content */}
    </div>
  );
};
```

### BrainSAIT Design Tokens

```typescript
// Official BrainSAIT colors
const colors = {
  midnightBlue: '#1a365d',
  medicalBlue: '#2b6cb8',
  signalTeal: '#0ea5e9',
  deepOrange: '#ea580c',
  professionalGray: '#64748b',
  accentPurple: '#7c3aed',
};

// Typography
const fonts = {
  arabic: 'IBM Plex Sans Arabic',
  english: 'Inter',
};

// Spacing (Tailwind scale)
const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
};
```

### Animation Standards

- Use Framer Motion for all animations
- Duration: 0.2-0.4s for most transitions
- Easing: `ease: [0.25, 0.1, 0.25, 1]` (smooth easing)
- Avoid animations >1s (medical context requires speed)

## API Development

### Standard Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from brainsait.auth import verify_token, require_permission
from brainsait.audit import audit_logger

router = APIRouter(prefix="/api/v1", tags=["patients"])

@router.post("/patients")
async def create_patient(
    request: PatientCreateRequest,
    user: User = Depends(require_permission("create:patient"))
):
    """
    BRAINSAIT: Create patient with full audit trail
    HIPAA: Logs patient creation for compliance
    """
    # Validate access
    audit_logger.log_api_request(
        endpoint="/api/v1/patients",
        user_id=user.id,
        action="create"
    )

    # Create patient
    patient = await patient_service.create(request.dict())

    return {"status": "success", "patient_id": patient.id}
```

### Required Middleware

1. **Authentication**: All endpoints except `/health` require JWT
2. **Rate Limiting**: Implement per-user rate limits
3. **Request Logging**: Log all requests with request ID
4. **Error Handling**: Never expose internal errors to clients

## FHIR Resource Patterns

### Creating FHIR Resources

```python
from fhir.resources.patient import Patient

# MEDICAL: Create FHIR R4 Patient resource
# BRAINSAIT: Uses BrainSAIT OID system
def create_fhir_patient(
    given_name: str,
    family_name: str,
    birth_date: str,
    gender: str,
    country: str = "SD"  # SD for Sudan, SA for Saudi Arabia
) -> Patient:
    # Determine OID based on country
    if country == "SD":
        oid_base = "1.3.6.1.4.1.61026.1.1"  # Sudan patients
    elif country == "SA":
        oid_base = "1.3.6.1.4.1.61026.2.1"  # Saudi patients
    else:
        raise ValueError(f"Unsupported country: {country}")

    patient = Patient(
        identifier=[{
            "system": f"urn:oid:{oid_base}",
            "value": generate_patient_id(country)
        }],
        name=[{
            "given": [given_name],
            "family": family_name,
            "use": "official"
        }],
        gender=gender,
        birthDate=birth_date
    )

    # Validate against FHIR R4 schema
    patient.validate()

    return patient
```

### Adding National Identifiers

```python
# BRAINSAIT: Add country-specific national ID
def add_national_identifier(
    patient: Patient,
    national_id: str,
    country: str
) -> Patient:
    """Add national identifier with BrainSAIT OID"""

    if country == "SD":
        system = "urn:oid:1.3.6.1.4.1.61026.1.1"
        type_display = "Sudan National ID"
    elif country == "SA":
        system = "urn:oid:1.3.6.1.4.1.61026.2.1"
        type_display = "Saudi National ID"
    else:
        raise ValueError(f"Unsupported country: {country}")

    identifier = {
        "system": system,
        "value": national_id,
        "type": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                "code": "NI",
                "display": type_display
            }]
        }
    }

    patient.identifier.append(identifier)
    patient.validate()
    return patient
```

## Error Handling

### Standard Error Pattern

```python
from brainsait.exceptions import (
    BrainSAITException,
    ValidationError,
    ComplianceError,
    UnauthorizedError
)

try:
    result = await process_patient_data(data)
except ValidationError as e:
    # Log validation error
    logger.error(f"Validation failed: {e}")
    raise HTTPException(status_code=422, detail=str(e))
except ComplianceError as e:
    # Critical compliance violation
    audit_logger.log_compliance_violation(error=str(e))
    raise HTTPException(status_code=500, detail="Compliance check failed")
except Exception as e:
    # Generic error
    logger.exception("Unexpected error")
    raise HTTPException(status_code=500, detail="Internal server error")
```

## Testing Standards

### Required Tests

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API endpoints
3. **FHIR Validation Tests**: Ensure FHIR compliance
4. **Security Tests**: Test authentication and authorization
5. **Bilingual Tests**: Test both Arabic and English

### Example Test

```python
import pytest
from fastapi.testclient import TestClient

@pytest.mark.medical
def test_create_patient_fhir_compliant():
    """MEDICAL: Test patient creation with FHIR validation"""
    patient = create_fhir_patient(
        given_name="Ahmad",
        family_name="AlSaudi",
        birth_date="1990-01-15",
        gender="male",
        country="SA"
    )

    # Validate FHIR compliance
    assert patient.resource_type == "Patient"
    assert len(patient.name) > 0

    # Verify BrainSAIT OID usage
    assert "1.3.6.1.4.1.61026.2.1" in patient.identifier[0]["system"]

    # Test national ID
    patient = add_national_identifier(patient, "1234567890", "SA")
    assert len(patient.identifier) == 2
```

## Environment Variables (Required)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/brainsait
REDIS_URL=redis://localhost:6379/0

# Security
JWT_SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# FHIR & OID
FHIR_SERVER_URL=https://fhir.brainsait.com
BRAINSAIT_OID_BASE=1.3.6.1.4.1.61026
NPHIES_API_URL=https://nphies.sa.gov.sa

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
API_VERSION=v1

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_PORT=9090
```

## Development Workflow

1. **Branch Naming**: `feature/description`, `bugfix/description`, `hotfix/description`
2. **Commit Messages**: Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
3. **Pull Requests**: Require code review and passing tests
4. **Pre-commit Hooks**: Run linters and formatters

## AI Agent Integration

When working with AI agents (defined in AGENTS.md):

- Use **MASTERLINC** for coordinating complex workflows
- Use **HEALTHCARELINC** for FHIR and clinical operations
- Use **TTLINC** for translation and localization
- Use **CLINICALLINC** for clinical decision support
- Use **COMPLIANCELINC** for audit and compliance checks

## Quick Reference

### Common Patterns

**Create Patient (Full Stack)**:
1. Frontend: Submit form → API call
2. Backend: Validate → Create FHIR resource (with BrainSAIT OID) → Encrypt PHI → Store
3. Audit: Log creation
4. Response: Return patient ID

**Bilingual Component**:
1. Import `useTranslation`
2. Detect language: `i18n.language`
3. Set direction: `dir={isRTL ? 'rtl' : 'ltr'}`
4. Use translation keys: `t('key')`

**API Endpoint**:
1. Define Pydantic models
2. Add authentication dependency
3. Implement authorization check
4. Log request
5. Process business logic
6. Log response
7. Return result

## Performance Targets

- **API Response Time**: <500ms for standard requests
- **Page Load Time**: <2s for initial load
- **Database Query Time**: <100ms for standard queries
- **WebSocket Latency**: <50ms for real-time updates

## Accessibility Requirements

- **WCAG 2.1 Level AA** compliance
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: ARIA labels for all components
- **Contrast Ratios**: Minimum 4.5:1 for normal text
- **Focus Indicators**: Visible focus states on all interactive elements

## Documentation Standards

- **Code Comments**: Explain why, not what
- **Docstrings**: Required for all public functions
- **API Docs**: Auto-generated OpenAPI/Swagger
- **README**: Updated with every major feature
- **Changelog**: Maintained for all releases

---

**Remember**: BrainSAIT handles sensitive healthcare data. Every line of code must prioritize security, compliance, and patient privacy. Always use the BrainSAIT OID namespace (1.3.6.1.4.1.61026) for all identifiers.

For task-specific instructions, see:
- `.instructions/fhir.md` - FHIR resource handling
- `.instructions/ui.md` - UI component development
- `.instructions/api.md` - API development
- `AGENTS.md` - AI agent configuration
