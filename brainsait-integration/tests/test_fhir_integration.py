"""
BrainSAIT FHIR Integration Tests
Tests for FHIR client and API integration
"""

import pytest
from fhir.client import FHIRClient, Country, BrainSAITOID
from datetime import datetime


@pytest.fixture
def fhir_client():
    """Create FHIR client instance"""
    return FHIRClient(base_url="http://localhost:8080/fhir")


@pytest.mark.asyncio
async def test_fhir_server_health(fhir_client):
    """Test FHIR server is accessible"""
    assert fhir_client.health_check() == True


@pytest.mark.asyncio
async def test_create_sudan_patient(fhir_client):
    """MEDICAL: Test creating Sudan patient with BrainSAIT OID"""
    patient = fhir_client.create_patient(
        given_name="Ahmad",
        family_name="Hassan",
        birth_date="1990-01-15",
        gender="male",
        country=Country.SUDAN,
        national_id="SD123456789"
    )

    assert patient.id is not None
    assert patient.gender == "male"
    assert patient.birthDate == "1990-01-15"

    # Verify BrainSAIT OID is used
    identifier_system = patient.identifier[0]["system"]
    assert "1.3.6.1.4.1.61026.1.1" in identifier_system

    print(f"✅ Sudan Patient created: {patient.id}")
    print(f"   OID: {identifier_system}")


@pytest.mark.asyncio
async def test_create_saudi_patient(fhir_client):
    """MEDICAL: Test creating Saudi patient with BrainSAIT OID"""
    patient = fhir_client.create_patient(
        given_name="Mohammed",
        family_name="AlRashid",
        birth_date="1985-06-20",
        gender="male",
        country=Country.SAUDI_ARABIA,
        national_id="SA987654321"
    )

    assert patient.id is not None
    assert patient.gender == "male"

    # Verify BrainSAIT OID is used
    identifier_system = patient.identifier[0]["system"]
    assert "1.3.6.1.4.1.61026.2.1" in identifier_system

    print(f"✅ Saudi Patient created: {patient.id}")
    print(f"   OID: {identifier_system}")


@pytest.mark.asyncio
async def test_create_bilingual_patient(fhir_client):
    """BILINGUAL: Test creating patient with Arabic name"""
    patient = fhir_client.create_patient(
        given_name="Ahmad",
        family_name="Hassan",
        birth_date="1990-01-15",
        gender="male",
        country=Country.SUDAN,
        arabic_given="أحمد",
        arabic_family="حسن"
    )

    assert patient.id is not None
    assert len(patient.name) == 2  # English and Arabic names

    # Find Arabic name
    arabic_name = next(
        n for n in patient.name
        if any(ext.get("valueCode") == "ar" for ext in n.get("extension", []))
    )

    assert arabic_name["given"][0] == "أحمد"
    assert arabic_name["family"] == "حسن"

    print(f"✅ Bilingual Patient created: {patient.id}")
    print(f"   English: {patient.name[0]['given'][0]} {patient.name[0]['family']}")
    print(f"   Arabic: {arabic_name['given'][0]} {arabic_name['family']}")


@pytest.mark.asyncio
async def test_search_patients(fhir_client):
    """MEDICAL: Test searching patients"""
    # Create test patient first
    patient = fhir_client.create_patient(
        given_name="Test",
        family_name="Patient",
        birth_date="2000-01-01",
        gender="female",
        country=Country.SUDAN,
        national_id="SDTEST001"
    )

    # Search by identifier
    results = fhir_client.search_patients(
        identifier="SDTEST001",
        country=Country.SUDAN
    )

    assert len(results) > 0
    assert results[0].id == patient.id

    print(f"✅ Patient search successful: Found {len(results)} patient(s)")


@pytest.mark.asyncio
async def test_create_observation(fhir_client):
    """MEDICAL: Test creating observation with BrainSAIT OID"""
    # Create patient first
    patient = fhir_client.create_patient(
        given_name="Lab",
        family_name="Test",
        birth_date="1995-05-05",
        gender="male",
        country=Country.SUDAN
    )

    # Create glucose observation
    observation = fhir_client.create_observation(
        patient_id=patient.id,
        code="2345-7",
        display="Glucose",
        value=95,
        unit="mg/dL",
        country=Country.SUDAN,
        reference_range_low=70,
        reference_range_high=100
    )

    assert observation.id is not None
    assert observation.subject.reference == f"Patient/{patient.id}"
    assert observation.valueQuantity.value == 95

    # Verify BrainSAIT OID for observation
    identifier_system = observation.identifier[0]["system"]
    assert "1.3.6.1.4.1.61026.1.5" in identifier_system

    print(f"✅ Observation created: {observation.id}")
    print(f"   Patient: {patient.id}")
    print(f"   Value: {observation.valueQuantity.value} {observation.valueQuantity.unit}")
    print(f"   OID: {identifier_system}")


@pytest.mark.asyncio
async def test_get_patient_observations(fhir_client):
    """MEDICAL: Test retrieving patient observations"""
    # Create patient and observation
    patient = fhir_client.create_patient(
        given_name="Obs",
        family_name="Test",
        birth_date="1992-03-10",
        gender="female",
        country=Country.SAUDI_ARABIA
    )

    fhir_client.create_observation(
        patient_id=patient.id,
        code="2345-7",
        display="Glucose",
        value=110,
        unit="mg/dL",
        country=Country.SAUDI_ARABIA
    )

    # Retrieve observations
    observations = fhir_client.get_patient_observations(patient.id)

    assert len(observations) > 0
    assert observations[0].subject.reference == f"Patient/{patient.id}"

    print(f"✅ Retrieved {len(observations)} observation(s) for patient {patient.id}")


@pytest.mark.asyncio
async def test_oid_namespace():
    """BRAINSAIT: Test OID namespace generation"""
    # Test Sudan OIDs
    assert BrainSAITOID.get_patient_oid(Country.SUDAN) == "1.3.6.1.4.1.61026.1.1"
    assert BrainSAITOID.get_practitioner_oid(Country.SUDAN) == "1.3.6.1.4.1.61026.1.2"
    assert BrainSAITOID.get_organization_oid(Country.SUDAN) == "1.3.6.1.4.1.61026.1.3"
    assert BrainSAITOID.get_observation_oid(Country.SUDAN) == "1.3.6.1.4.1.61026.1.5"

    # Test Saudi OIDs
    assert BrainSAITOID.get_patient_oid(Country.SAUDI_ARABIA) == "1.3.6.1.4.1.61026.2.1"
    assert BrainSAITOID.get_practitioner_oid(Country.SAUDI_ARABIA) == "1.3.6.1.4.1.61026.2.2"
    assert BrainSAITOID.get_organization_oid(Country.SAUDI_ARABIA) == "1.3.6.1.4.1.61026.2.3"
    assert BrainSAITOID.get_observation_oid(Country.SAUDI_ARABIA) == "1.3.6.1.4.1.61026.2.5"

    print("✅ All OID namespaces correct")
    print(f"   Base: {BrainSAITOID.BASE}")
    print(f"   Sudan Patient: {BrainSAITOID.SUDAN_PATIENT}")
    print(f"   Saudi Patient: {BrainSAITOID.SAUDI_PATIENT}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
