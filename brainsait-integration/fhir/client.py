"""
BrainSAIT FHIR Client Library
Integrates with local HAPI FHIR server using BrainSAIT OID namespace
"""

from typing import Optional, Dict, Any, List
from fhir.resources.patient import Patient
from fhir.resources.observation import Observation
from fhir.resources.organization import Organization
from fhir.resources.practitioner import Practitioner
from fhir.resources.bundle import Bundle
import requests
import logging
from datetime import datetime
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Country(str, Enum):
    """Supported countries with OID branches"""
    SUDAN = "SD"
    SAUDI_ARABIA = "SA"


class BrainSAITOID:
    """
    BRAINSAIT: OID namespace manager for BrainSAIT
    Base OID: 1.3.6.1.4.1.61026
    """

    BASE = "1.3.6.1.4.1.61026"

    # Sudan Branch (.1)
    SUDAN_PATIENT = "1.3.6.1.4.1.61026.1.1"
    SUDAN_PRACTITIONER = "1.3.6.1.4.1.61026.1.2"
    SUDAN_ORGANIZATION = "1.3.6.1.4.1.61026.1.3"
    SUDAN_LOCATION = "1.3.6.1.4.1.61026.1.4"
    SUDAN_OBSERVATION = "1.3.6.1.4.1.61026.1.5"

    # Saudi Arabia Branch (.2)
    SAUDI_PATIENT = "1.3.6.1.4.1.61026.2.1"
    SAUDI_PRACTITIONER = "1.3.6.1.4.1.61026.2.2"
    SAUDI_ORGANIZATION = "1.3.6.1.4.1.61026.2.3"
    SAUDI_LOCATION = "1.3.6.1.4.1.61026.2.4"
    SAUDI_OBSERVATION = "1.3.6.1.4.1.61026.2.5"

    @classmethod
    def get_patient_oid(cls, country: Country) -> str:
        """Get patient OID for country"""
        return cls.SUDAN_PATIENT if country == Country.SUDAN else cls.SAUDI_PATIENT

    @classmethod
    def get_practitioner_oid(cls, country: Country) -> str:
        """Get practitioner OID for country"""
        return cls.SUDAN_PRACTITIONER if country == Country.SUDAN else cls.SAUDI_PRACTITIONER

    @classmethod
    def get_organization_oid(cls, country: Country) -> str:
        """Get organization OID for country"""
        return cls.SUDAN_ORGANIZATION if country == Country.SUDAN else cls.SAUDI_ORGANIZATION

    @classmethod
    def get_observation_oid(cls, country: Country) -> str:
        """Get observation OID for country"""
        return cls.SUDAN_OBSERVATION if country == Country.SUDAN else cls.SAUDI_OBSERVATION


class FHIRClient:
    """
    MEDICAL: BrainSAIT FHIR Client
    Connects to local HAPI FHIR server with BrainSAIT OID namespace
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8080/fhir",
        timeout: int = 30
    ):
        """
        Initialize FHIR client

        Args:
            base_url: FHIR server base URL
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
        })

        logger.info(f"Initialized FHIR client: {self.base_url}")

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        BRAINSAIT: Make HTTP request to FHIR server with error handling

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: FHIR endpoint
            data: Request body (for POST/PUT)
            params: Query parameters

        Returns:
            Response data as dictionary

        Raises:
            requests.HTTPError: On HTTP errors
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()

            # Return JSON if available
            if response.content:
                return response.json()
            return {}

        except requests.exceptions.RequestException as e:
            logger.error(f"FHIR request failed: {method} endpoint - {str(e)}")
            raise

    def health_check(self) -> bool:
        """
        Check if FHIR server is accessible

        Returns:
            True if server is healthy
        """
        try:
            metadata = self._make_request('GET', '/metadata')
            return metadata.get('resourceType') == 'CapabilityStatement'
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False

    def create_patient(
        self,
        given_name: str,
        family_name: str,
        birth_date: str,
        gender: str,
        country: Country,
        national_id: Optional[str] = None,
        arabic_given: Optional[str] = None,
        arabic_family: Optional[str] = None
    ) -> Patient:
        """
        MEDICAL: Create FHIR Patient resource with BrainSAIT OID

        Args:
            given_name: Patient given name (English)
            family_name: Patient family name (English)
            birth_date: Birth date (YYYY-MM-DD)
            gender: Gender (male|female|other|unknown)
            country: Country (Sudan or Saudi Arabia)
            national_id: National identifier
            arabic_given: Given name in Arabic (optional)
            arabic_family: Family name in Arabic (optional)

        Returns:
            Created Patient resource
        """
        # BRAINSAIT: Get appropriate OID for country
        oid_system = BrainSAITOID.get_patient_oid(country)

        # Build patient data
        patient_data = {
            "resourceType": "Patient",
            "identifier": [{
                "system": f"urn:oid:{oid_system}",
                "value": national_id or f"{country.value}{datetime.now().strftime('%Y%m%d%H%M%S')}"
            }],
            "name": [{
                "given": [given_name],
                "family": family_name,
                "use": "official"
            }],
            "gender": gender,
            "birthDate": birth_date
        }

        # BILINGUAL: Add Arabic name if provided
        if arabic_given and arabic_family:
            patient_data["name"].append({
                "given": [arabic_given],
                "family": arabic_family,
                "use": "official",
                "extension": [{
                    "url": "http://hl7.org/fhir/StructureDefinition/language",
                    "valueCode": "ar"
                }]
            })

        # Create patient on FHIR server
        response = self._make_request('POST', '/Patient', data=patient_data)

        logger.info(
            f"Patient created: {response['id']} "
            f"(Country: {country.value}, OID: {oid_system})"
        )

        return Patient(**response)

    def get_patient(self, patient_id: str) -> Optional[Patient]:
        """
        MEDICAL: Retrieve patient by ID

        Args:
            patient_id: FHIR patient ID

        Returns:
            Patient resource or None if not found
        """
        try:
            response = self._make_request('GET', f'/Patient/{patient_id}')
            return Patient(**response)
        except requests.HTTPError as e:
            if e.response.status_code == 404:
                logger.warning(f"Patient not found: {patient_id}")
                return None
            raise

    def search_patients(
        self,
        name: Optional[str] = None,
        identifier: Optional[str] = None,
        country: Optional[Country] = None,
        limit: int = 100
    ) -> List[Patient]:
        """
        MEDICAL: Search for patients

        Args:
            name: Patient name to search
            identifier: Patient identifier
            country: Filter by country (uses OID system)
            limit: Maximum results

        Returns:
            List of matching patients
        """
        params = {"_count": limit}

        if name:
            params["name"] = name

        if identifier:
            # BRAINSAIT: Search by identifier with OID system
            if country:
                oid = BrainSAITOID.get_patient_oid(country)
                params["identifier"] = f"urn:oid:{oid}|{identifier}"
            else:
                params["identifier"] = identifier

        response = self._make_request('GET', '/Patient', params=params)

        patients = []
        if response.get('entry'):
            for entry in response['entry']:
                patients.append(Patient(**entry['resource']))

        logger.info(f"Found {len(patients)} patients matching search criteria")
        return patients

    def create_observation(
        self,
        patient_id: str,
        code: str,
        display: str,
        value: float,
        unit: str,
        country: Country,
        status: str = "final",
        reference_range_low: Optional[float] = None,
        reference_range_high: Optional[float] = None
    ) -> Observation:
        """
        MEDICAL: Create FHIR Observation (lab result, vital sign)

        Args:
            patient_id: Reference to patient
            code: LOINC code
            display: Human-readable description
            value: Numeric value
            unit: Unit of measurement (UCUM)
            country: Country for OID
            status: Observation status
            reference_range_low: Lower reference range
            reference_range_high: Upper reference range

        Returns:
            Created Observation resource
        """
        # BRAINSAIT: Get OID for observation
        oid_system = BrainSAITOID.get_observation_oid(country)

        observation_data = {
            "resourceType": "Observation",
            "status": status,
            "identifier": [{
                "system": f"urn:oid:{oid_system}",
                "value": f"OBS-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            }],
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": code,
                    "display": display
                }]
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "valueQuantity": {
                "value": value,
                "unit": unit,
                "system": "http://unitsofmeasure.org"
            }
        }

        # Add reference range if provided
        if reference_range_low is not None and reference_range_high is not None:
            observation_data["referenceRange"] = [{
                "low": {
                    "value": reference_range_low,
                    "unit": unit
                },
                "high": {
                    "value": reference_range_high,
                    "unit": unit
                }
            }]

        response = self._make_request('POST', '/Observation', data=observation_data)

        logger.info(f"Observation created: {response['id']} for patient [REDACTED]")
        return Observation(**response)

    def get_patient_observations(self, patient_id: str) -> List[Observation]:
        """
        MEDICAL: Get all observations for a patient

        Args:
            patient_id: FHIR patient ID

        Returns:
            List of observations
        """
        params = {
            "subject": f"Patient/{patient_id}",
            "_sort": "-date"
        }

        response = self._make_request('GET', '/Observation', params=params)

        observations = []
        if response.get('entry'):
            for entry in response['entry']:
                observations.append(Observation(**entry['resource']))

        logger.info(f"Found {len(observations)} observations for patient {patient_id}")
        return observations

    def create_organization(
        self,
        name: str,
        country: Country,
        active: bool = True
    ) -> Organization:
        """
        BRAINSAIT: Create FHIR Organization with BrainSAIT OID

        Args:
            name: Organization name
            country: Country
            active: Whether organization is active

        Returns:
            Created Organization resource
        """
        oid_system = BrainSAITOID.get_organization_oid(country)

        org_data = {
            "resourceType": "Organization",
            "identifier": [{
                "system": f"urn:oid:{oid_system}",
                "value": f"ORG-{country.value}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            }],
            "active": active,
            "name": name
        }

        response = self._make_request('POST', '/Organization', data=org_data)

        logger.info(f"Organization created: {response['id']} ({country.value})")
        return Organization(**response)

    def validate_resource(self, resource_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        MEDICAL: Validate FHIR resource against FHIR R4 schema

        Args:
            resource_dict: FHIR resource as dictionary

        Returns:
            OperationOutcome with validation results
        """
        resource_type = resource_dict.get('resourceType')
        response = self._make_request(
            'POST',
            f'/{resource_type}/$validate',
            data=resource_dict
        )

        return response
