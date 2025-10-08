"""
BrainSAIT FHIR API Endpoints
FastAPI integration with local FHIR server
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Import BrainSAIT FHIR client
import sys
sys.path.append('..')
from fhir.client import FHIRClient, Country, BrainSAITOID

router = APIRouter(prefix="/api/v1/fhir", tags=["FHIR"])
security = HTTPBearer()

# Initialize FHIR client
fhir_client = FHIRClient()


class CountryCode(str, Enum):
    """Country codes for API"""
    SUDAN = "SD"
    SAUDI_ARABIA = "SA"


class PatientCreateRequest(BaseModel):
    """MEDICAL: FHIR Patient creation request"""
    given_name: str = Field(..., description="Patient given name (English)")
    family_name: str = Field(..., description="Patient family name (English)")
    birth_date: str = Field(..., description="Birth date (YYYY-MM-DD)", regex=r'^\d{4}-\d{2}-\d{2}$')
    gender: str = Field(..., description="Gender", regex=r'^(male|female|other|unknown)$')
    country: CountryCode = Field(..., description="Country code (SD or SA)")
    national_id: Optional[str] = Field(None, description="National identifier")
    arabic_given: Optional[str] = Field(None, description="Given name in Arabic")
    arabic_family: Optional[str] = Field(None, description="Family name in Arabic")

    class Config:
        schema_extra = {
            "example": {
                "given_name": "Ahmad",
                "family_name": "Hassan",
                "birth_date": "1990-01-15",
                "gender": "male",
                "country": "SD",
                "national_id": "SD123456789",
                "arabic_given": "أحمد",
                "arabic_family": "حسن"
            }
        }


class PatientResponse(BaseModel):
    """MEDICAL: FHIR Patient response"""
    id: str
    identifier: List[dict]
    name: List[dict]
    gender: str
    birth_date: str
    country: str
    oid_system: str


class ObservationCreateRequest(BaseModel):
    """MEDICAL: FHIR Observation creation request"""
    patient_id: str = Field(..., description="FHIR Patient ID")
    code: str = Field(..., description="LOINC code")
    display: str = Field(..., description="Human-readable description")
    value: float = Field(..., description="Numeric value")
    unit: str = Field(..., description="Unit of measurement (UCUM)")
    country: CountryCode = Field(..., description="Country code")
    reference_range_low: Optional[float] = Field(None, description="Lower reference range")
    reference_range_high: Optional[float] = Field(None, description="Upper reference range")

    class Config:
        schema_extra = {
            "example": {
                "patient_id": "123",
                "code": "2345-7",
                "display": "Glucose",
                "value": 95,
                "unit": "mg/dL",
                "country": "SD",
                "reference_range_low": 70,
                "reference_range_high": 100
            }
        }


@router.get("/health")
async def health_check():
    """
    Check FHIR server health

    Returns:
        Health status
    """
    is_healthy = fhir_client.health_check()

    if not is_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="FHIR server is not accessible"
        )

    return {
        "status": "healthy",
        "fhir_server": fhir_client.base_url,
        "timestamp": datetime.utcnow().isoformat(),
        "oid_base": BrainSAITOID.BASE
    }


@router.post("/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    request: PatientCreateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Create FHIR Patient with BrainSAIT OID

    Creates a new patient record in the FHIR server with the appropriate
    OID namespace based on country.

    - **Sudan**: Uses OID 1.3.6.1.4.1.61026.1.1
    - **Saudi Arabia**: Uses OID 1.3.6.1.4.1.61026.2.1
    """
    try:
        # Convert country code to enum
        country = Country.SUDAN if request.country == CountryCode.SUDAN else Country.SAUDI_ARABIA

        # Create patient using FHIR client
        patient = fhir_client.create_patient(
            given_name=request.given_name,
            family_name=request.family_name,
            birth_date=request.birth_date,
            gender=request.gender,
            country=country,
            national_id=request.national_id,
            arabic_given=request.arabic_given,
            arabic_family=request.arabic_family
        )

        # Get OID system used
        oid_system = BrainSAITOID.get_patient_oid(country)

        return PatientResponse(
            id=patient.id,
            identifier=patient.identifier,
            name=patient.name,
            gender=patient.gender,
            birth_date=patient.birthDate,
            country=request.country.value,
            oid_system=f"urn:oid:{oid_system}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create patient: {str(e)}"
        )


@router.get("/patients/{patient_id}")
async def get_patient(
    patient_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Retrieve patient by ID

    Returns FHIR Patient resource including all identifiers and names.
    """
    patient = fhir_client.get_patient(patient_id)

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient not found: {patient_id}"
        )

    return patient.dict()


@router.get("/patients")
async def search_patients(
    name: Optional[str] = None,
    identifier: Optional[str] = None,
    country: Optional[CountryCode] = None,
    limit: int = 20,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Search for patients

    Search patients by name, identifier, or country.
    When country is specified, search uses country-specific OID namespace.
    """
    country_enum = None
    if country:
        country_enum = Country.SUDAN if country == CountryCode.SUDAN else Country.SAUDI_ARABIA

    patients = fhir_client.search_patients(
        name=name,
        identifier=identifier,
        country=country_enum,
        limit=limit
    )

    return {
        "total": len(patients),
        "patients": [p.dict() for p in patients]
    }


@router.post("/observations", status_code=status.HTTP_201_CREATED)
async def create_observation(
    request: ObservationCreateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Create FHIR Observation (lab result, vital sign)

    Creates an observation linked to a patient with country-specific OID.

    - **Sudan**: Uses OID 1.3.6.1.4.1.61026.1.5
    - **Saudi Arabia**: Uses OID 1.3.6.1.4.1.61026.2.5
    """
    try:
        # Verify patient exists
        patient = fhir_client.get_patient(request.patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient not found: {request.patient_id}"
            )

        # Convert country code
        country = Country.SUDAN if request.country == CountryCode.SUDAN else Country.SAUDI_ARABIA

        # Create observation
        observation = fhir_client.create_observation(
            patient_id=request.patient_id,
            code=request.code,
            display=request.display,
            value=request.value,
            unit=request.unit,
            country=country,
            reference_range_low=request.reference_range_low,
            reference_range_high=request.reference_range_high
        )

        return observation.dict()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create observation: {str(e)}"
        )


@router.get("/patients/{patient_id}/observations")
async def get_patient_observations(
    patient_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Get all observations for a patient

    Returns all lab results, vital signs, and other observations
    linked to the specified patient.
    """
    # Verify patient exists
    patient = fhir_client.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient not found: {patient_id}"
        )

    observations = fhir_client.get_patient_observations(patient_id)

    return {
        "patient_id": patient_id,
        "total": len(observations),
        "observations": [obs.dict() for obs in observations]
    }


@router.get("/oid/{country}")
async def get_oid_info(country: CountryCode):
    """
    BRAINSAIT: Get OID namespace information for country

    Returns all OID namespaces used for the specified country.
    """
    country_enum = Country.SUDAN if country == CountryCode.SUDAN else Country.SAUDI_ARABIA

    return {
        "country": country.value,
        "oid_base": BrainSAITOID.BASE,
        "oids": {
            "patient": BrainSAITOID.get_patient_oid(country_enum),
            "practitioner": BrainSAITOID.get_practitioner_oid(country_enum),
            "organization": BrainSAITOID.get_organization_oid(country_enum),
            "observation": BrainSAITOID.get_observation_oid(country_enum)
        }
    }


@router.post("/validate")
async def validate_resource(
    resource: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Validate FHIR resource against FHIR R4 schema

    Validates a FHIR resource without creating it in the server.
    Returns OperationOutcome with validation results.
    """
    try:
        result = fhir_client.validate_resource(resource)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}"
        )
