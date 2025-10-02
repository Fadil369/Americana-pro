---
applyTo:
  - "**/*fhir*"
  - "**/*patient*"
  - "**/*observation*"
  - "**/*encounter*"
  - "**/resources/**"
---

# FHIR Resource Implementation Instructions

## Overview
These instructions apply to all FHIR R4 resource handling code. Follow these patterns for consistent, compliant FHIR implementations using BrainSAIT's OID namespace.

## BrainSAIT OID System

**Base OID**: `1.3.6.1.4.1.61026`

**Country Branches**:
- Sudan: `1.3.6.1.4.1.61026.1`
  - Patients: `1.3.6.1.4.1.61026.1.1`
  - Providers: `1.3.6.1.4.1.61026.1.2`
  - Organizations: `1.3.6.1.4.1.61026.1.3`
  - Facilities: `1.3.6.1.4.1.61026.1.4`

- Saudi Arabia: `1.3.6.1.4.1.61026.2`
  - Patients: `1.3.6.1.4.1.61026.2.1`
  - Providers: `1.3.6.1.4.1.61026.2.2`
  - Organizations: `1.3.6.1.4.1.61026.2.3`
  - Facilities: `1.3.6.1.4.1.61026.2.4`

## Required Imports

### Python
```python
from fhir.resources.patient import Patient
from fhir.resources.observation import Observation
from fhir.resources.encounter import Encounter
from fhir.resources.practitioner import Practitioner
from fhir.resources.organization import Organization
from pydantic import ValidationError
from typing import Optional, List, Dict, Any
import logging
```

### TypeScript
```typescript
import { Patient, Observation, Encounter, Practitioner } from '@types/fhir';
import { FHIRValidator } from '@/lib/fhir/validator';
```

## Standard FHIR Resource Pattern

### Creation with BrainSAIT OID
```python
def create_fhir_patient(
    patient_id: str,
    given_name: str,
    family_name: str,
    birth_date: str,
    gender: str,
    country: str = "SD",  # SD for Sudan, SA for Saudi Arabia
    active: bool = True
) -> Patient:
    """
    MEDICAL: Create FHIR R4 compliant Patient resource
    BRAINSAIT: Uses BrainSAIT OID namespace (1.3.6.1.4.1.61026)

    Args:
        patient_id: Unique patient identifier
        given_name: Patient given name(s)
        family_name: Patient family name
        birth_date: Birth date in YYYY-MM-DD format
        gender: Gender (male|female|other|unknown)
        country: Country code (SD=Sudan, SA=Saudi Arabia)
        active: Whether patient record is active

    Returns:
        Patient: Validated FHIR Patient resource

    Raises:
        ValidationError: If data doesn't meet FHIR R4 schema

    Examples:
        >>> # Sudan patient
        >>> patient = create_fhir_patient(
        ...     patient_id="SD123456",
        ...     given_name="Ahmad",
        ...     family_name="AlSaudi",
        ...     birth_date="1990-01-15",
        ...     gender="male",
        ...     country="SD"
        ... )

        >>> # Saudi patient
        >>> patient = create_fhir_patient(
        ...     patient_id="SA987654",
        ...     given_name="Mohammed",
        ...     family_name="AlRashid",
        ...     birth_date="1985-06-20",
        ...     gender="male",
        ...     country="SA"
        ... )
    """
    try:
        # BRAINSAIT: Determine OID based on country
        if country == "SD":
            identifier_system = "urn:oid:1.3.6.1.4.1.61026.1.1"
        elif country == "SA":
            identifier_system = "urn:oid:1.3.6.1.4.1.61026.2.1"
        else:
            raise ValueError(f"Unsupported country code: {country}")

        patient = Patient(
            id=patient_id,
            identifier=[{
                "system": identifier_system,
                "value": patient_id
            }],
            active=active,
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

        logging.info(
            f"FHIR Patient resource created: {patient_id} "
            f"(Country: {country}, OID: {identifier_system})"
        )
        return patient

    except ValidationError as e:
        logging.error(f"FHIR validation failed for patient {patient_id}: {e}")
        raise
```

### Validation
```python
def validate_fhir_resource(resource: Any, resource_type: str) -> bool:
    """
    MEDICAL: Validate FHIR resource against R4 schema
    BRAINSAIT: Verify BrainSAIT OID namespace usage

    Args:
        resource: FHIR resource to validate
        resource_type: Expected resource type (Patient, Observation, etc.)

    Returns:
        bool: True if valid

    Raises:
        ValidationError: If resource fails validation
    """
    try:
        # Check resource type matches
        if resource.resource_type != resource_type:
            raise ValidationError(
                f"Expected {resource_type}, got {resource.resource_type}"
            )

        # Perform full validation
        resource.validate()

        # BRAINSAIT: Verify OID usage
        if hasattr(resource, 'identifier') and resource.identifier:
            for identifier in resource.identifier:
                system = identifier.get('system', '')
                if 'oid:1.3.6.1.4.1.61026' not in system:
                    logging.warning(
                        f"Resource {resource.id} not using BrainSAIT OID namespace"
                    )

        # Additional BrainSAIT-specific checks
        if hasattr(resource, 'identifier') and not resource.identifier:
            raise ValidationError("Resource must have at least one identifier")

        return True

    except Exception as e:
        logging.error(f"FHIR validation error: {e}")
        raise
```

### Adding National Identifiers
```python
def add_national_identifier(
    patient: Patient,
    national_id: str,
    country: str
) -> Patient:
    """
    BRAINSAIT: Add country-specific national ID with BrainSAIT OID

    Args:
        patient: Existing Patient resource
        national_id: National ID number
        country: Country code (SD or SA)

    Returns:
        Patient: Updated patient with national ID
    """
    if country == "SD":
        system = "urn:oid:1.3.6.1.4.1.61026.1.1"
        type_display = "Sudan National ID"
        type_code = "NI"
    elif country == "SA":
        system = "urn:oid:1.3.6.1.4.1.61026.2.1"
        type_display = "Saudi National ID"
        type_code = "NI"
    else:
        raise ValueError(f"Unsupported country: {country}")

    identifier = {
        "system": system,
        "value": national_id,
        "type": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                "code": type_code,
                "display": type_display
            }]
        }
    }

    patient.identifier.append(identifier)
    patient.validate()

    logging.info(
        f"Added {type_display} to patient {patient.id}: {national_id}"
    )

    return patient
```

## Observation Pattern (Lab Results, Vitals)

```python
def create_lab_observation(
    patient_id: str,
    code: str,
    display: str,
    value: float,
    unit: str,
    country: str = "SD",
    reference_range_low: Optional[float] = None,
    reference_range_high: Optional[float] = None,
    status: str = "final"
) -> Observation:
    """
    MEDICAL: Create FHIR Observation for laboratory results
    BRAINSAIT: Uses BrainSAIT OID namespace for identifiers

    Args:
        patient_id: Reference to patient
        code: LOINC code for observation
        display: Human-readable name
        value: Numeric value
        unit: Unit of measurement (UCUM)
        country: Country code for OID selection
        reference_range_low: Lower bound of normal range
        reference_range_high: Upper bound of normal range
        status: Observation status (registered|preliminary|final|amended)

    Returns:
        Observation: Validated FHIR Observation resource
    """
    # BRAINSAIT: Generate observation ID with country-specific OID
    if country == "SD":
        obs_system = "urn:oid:1.3.6.1.4.1.61026.1.5"  # Sudan observations
    elif country == "SA":
        obs_system = "urn:oid:1.3.6.1.4.1.61026.2.5"  # Saudi observations
    else:
        raise ValueError(f"Unsupported country: {country}")

    observation = Observation(
        status=status,
        identifier=[{
            "system": obs_system,
            "value": f"OBS-{generate_unique_id()}"
        }],
        code={
            "coding": [{
                "system": "http://loinc.org",
                "code": code,
                "display": display
            }]
        },
        subject={
            "reference": f"Patient/{patient_id}"
        },
        valueQuantity={
            "value": value,
            "unit": unit,
            "system": "http://unitsofmeasure.org"
        }
    )

    # Add reference range if provided
    if reference_range_low is not None and reference_range_high is not None:
        observation.referenceRange = [{
            "low": {
                "value": reference_range_low,
                "unit": unit
            },
            "high": {
                "value": reference_range_high,
                "unit": unit
            }
        }]

    observation.validate()
    return observation
```

## Organization Resource

```python
def create_organization(
    organization_id: str,
    name: str,
    country: str,
    active: bool = True
) -> Organization:
    """
    BRAINSAIT: Create FHIR Organization with BrainSAIT OID

    Args:
        organization_id: Unique organization identifier
        name: Organization name
        country: Country code (SD or SA)
        active: Whether organization is active

    Returns:
        Organization: Validated FHIR Organization resource
    """
    if country == "SD":
        org_system = "urn:oid:1.3.6.1.4.1.61026.1.3"
    elif country == "SA":
        org_system = "urn:oid:1.3.6.1.4.1.61026.2.3"
    else:
        raise ValueError(f"Unsupported country: {country}")

    organization = Organization(
        id=organization_id,
        identifier=[{
            "system": org_system,
            "value": organization_id
        }],
        active=active,
        name=name
    )

    organization.validate()
    return organization
```

## Practitioner Resource

```python
def create_practitioner(
    practitioner_id: str,
    given_name: str,
    family_name: str,
    country: str,
    active: bool = True
) -> Practitioner:
    """
    BRAINSAIT: Create FHIR Practitioner with BrainSAIT OID

    Args:
        practitioner_id: Unique practitioner identifier
        given_name: Practitioner given name
        family_name: Practitioner family name
        country: Country code (SD or SA)
        active: Whether practitioner is active

    Returns:
        Practitioner: Validated FHIR Practitioner resource
    """
    if country == "SD":
        prac_system = "urn:oid:1.3.6.1.4.1.61026.1.2"
    elif country == "SA":
        prac_system = "urn:oid:1.3.6.1.4.1.61026.2.2"
    else:
        raise ValueError(f"Unsupported country: {country}")

    practitioner = Practitioner(
        id=practitioner_id,
        identifier=[{
            "system": prac_system,
            "value": practitioner_id
        }],
        active=active,
        name=[{
            "given": [given_name],
            "family": family_name,
            "use": "official"
        }]
    )

    practitioner.validate()
    return practitioner
```

## Bilingual Support in FHIR

### Arabic Extensions
```python
def add_arabic_name(
    patient: Patient,
    arabic_given: str,
    arabic_family: str
) -> Patient:
    """
    BILINGUAL: Add Arabic name extension to Patient

    Args:
        patient: Existing Patient resource
        arabic_given: Given name in Arabic
        arabic_family: Family name in Arabic

    Returns:
        Patient: Updated patient with Arabic name
    """
    arabic_name = {
        "given": [arabic_given],
        "family": arabic_family,
        "use": "official",
        "extension": [{
            "url": "http://hl7.org/fhir/StructureDefinition/language",
            "valueCode": "ar"
        }]
    }

    patient.name.append(arabic_name)
    patient.validate()
    return patient
```

## Error Handling

```python
from brainsait.exceptions import FHIRValidationError

def safe_fhir_operation(operation_func):
    """
    MEDICAL: Decorator for safe FHIR operations with audit logging
    """
    def wrapper(*args, **kwargs):
        try:
            result = operation_func(*args, **kwargs)
            audit_logger.log_fhir_operation(
                operation=operation_func.__name__,
                status='success'
            )
            return result
        except ValidationError as e:
            audit_logger.log_fhir_operation(
                operation=operation_func.__name__,
                status='validation_error',
                error=str(e)
            )
            raise FHIRValidationError(f"FHIR validation failed: {e}")
        except Exception as e:
            audit_logger.log_fhir_operation(
                operation=operation_func.__name__,
                status='error',
                error=str(e)
            )
            raise
    return wrapper
```

## Testing FHIR Resources

```python
import pytest
from fhir.resources.patient import Patient

@pytest.mark.medical
def test_patient_creation_with_brainsait_oid():
    """MEDICAL: Test patient creation with BrainSAIT OID"""
    # Test Sudan patient
    patient_sd = create_fhir_patient(
        patient_id="SD001",
        given_name="Ahmad",
        family_name="Hassan",
        birth_date="1990-01-15",
        gender="male",
        country="SD"
    )

    assert patient_sd.identifier[0]["system"] == "urn:oid:1.3.6.1.4.1.61026.1.1"

    # Test Saudi patient
    patient_sa = create_fhir_patient(
        patient_id="SA001",
        given_name="Mohammed",
        family_name="AlRashid",
        birth_date="1985-06-20",
        gender="male",
        country="SA"
    )

    assert patient_sa.identifier[0]["system"] == "urn:oid:1.3.6.1.4.1.61026.2.1"

@pytest.mark.bilingual
def test_patient_arabic_name():
    """BILINGUAL: Test Arabic name extension"""
    patient = create_fhir_patient(
        patient_id="SD002",
        given_name="Ahmad",
        family_name="Hassan",
        birth_date="1990-01-15",
        gender="male",
        country="SD"
    )

    patient = add_arabic_name(patient, "أحمد", "حسن")

    assert len(patient.name) == 2
    arabic_name = next(n for n in patient.name if any(
        ext.get("valueCode") == "ar" for ext in n.get("extension", [])
    ))
    assert arabic_name["given"][0] == "أحمد"
```

## Performance Optimization

- Always use batch operations for multiple resources
- Cache validated schemas to avoid repeated validation
- Use async operations for external FHIR server calls
- Index FHIR resources by identifier for fast lookup
- Implement pagination for large resource sets

## Security Checklist

- [ ] Validate all FHIR resources before storage
- [ ] Encrypt PHI in Patient and Observation resources
- [ ] Log all FHIR resource access for audit
- [ ] Implement role-based access to resources
- [ ] Sanitize all input data before FHIR conversion
- [ ] Use HTTPS for all FHIR server communication
- [ ] Verify correct BrainSAIT OID usage (1.3.6.1.4.1.61026)
- [ ] Validate country-specific OID branches

---

**Remember:** FHIR resources contain PHI. Always encrypt, validate, audit, and use the correct BrainSAIT OID namespace for all identifiers.
