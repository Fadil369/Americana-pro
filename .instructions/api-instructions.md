---
applyTo:
  - "**/api/**"
  - "**/routes/**"
  - "**/endpoints/**"
  - "**/*api*"
  - "**/server/**"
---

# API Development Instructions

## Overview
All APIs must follow FastAPI patterns with comprehensive security, audit logging, and FHIR compliance using BrainSAIT OID namespace.

## Standard API Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from brainsait.auth import verify_token, validate_role
from brainsait.audit import audit_logger
from brainsait.exceptions import ComplianceError

router = APIRouter(prefix="/api/v1", tags=["patients"])
security = HTTPBearer()

# Request/Response Models
class PatientCreateRequest(BaseModel):
    """MEDICAL: FHIR-compliant patient creation request"""
    given_name: str
    family_name: str
    birth_date: str
    gender: str
    country: str  # SD or SA
    national_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "given_name": "Ahmad",
                "family_name": "Hassan",
                "birth_date": "1990-01-15",
                "gender": "male",
                "country": "SD",
                "national_id": "SD123456789"
            }
        }

# Endpoint Implementation
@router.post(
    "/patients",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_patient(
    request: PatientCreateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> PatientResponse:
    """
    BRAINSAIT: Create patient with full audit trail
    Uses BrainSAIT OID namespace based on country
    """
    # Authenticate and authorize
    user = await verify_token(credentials.credentials)
    if not validate_role(user.role, "create:patient"):
        audit_logger.log_unauthorized_access(
            user_id=user.id,
            endpoint="/api/v1/patients",
            action="create"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Log request
    audit_logger.log_api_request(
        endpoint="/api/v1/patients",
        method="POST",
        user_id=user.id,
        country=request.country
    )
    
    # Create FHIR patient with BrainSAIT OID
    patient = await create_fhir_patient(
        patient_id=generate_patient_id(request.country),
        given_name=request.given_name,
        family_name=request.family_name,
        birth_date=request.birth_date,
        gender=request.gender,
        country=request.country
    )
    
    # Add national ID if provided
    if request.national_id:
        patient = add_national_identifier(
            patient,
            request.national_id,
            request.country
        )
    
    # Store (encrypted)
    await store_patient(patient, user.id)
    
    # Log success
    audit_logger.log_patient_created(
        patient_id=patient.id,
        created_by=user.id,
        country=request.country
    )
    
    return PatientResponse(
        id=patient.id,
        resource_type="Patient",
        status="active",
        fhir_resource=patient.dict()
    )
```

## Authentication & Authorization

### Role-Based Access Control
```python
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    PROVIDER = "provider"
    PATIENT = "patient"
    AUDITOR = "auditor"

class Permission(str, Enum):
    CREATE_PATIENT = "create:patient"
    READ_PATIENT = "read:patient"
    UPDATE_PATIENT = "update:patient"
    READ_CLINICAL_DATA = "read:clinical_data"
    WRITE_CLINICAL_DATA = "write:clinical_data"
```

## API Security Checklist

Before deploying API endpoints:

- [ ] JWT token validation implemented
- [ ] Role-based access control enforced
- [ ] All requests logged with audit trail
- [ ] PHI encrypted at rest
- [ ] Rate limiting configured
- [ ] Input validation with Pydantic
- [ ] SQL injection prevention
- [ ] HTTPS enforced
- [ ] Error messages don't expose sensitive data
- [ ] Correct BrainSAIT OID usage verified

---

**Remember:** Every API endpoint is a potential entry point. Security, audit logging, and compliance must be implemented for all endpoints.
