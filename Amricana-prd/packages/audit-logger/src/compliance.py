# BRAINSAIT: Compliance validation module
# ZATCA: Saudi e-invoicing compliance
# PDPL: Saudi Personal Data Protection Law compliance
# HIPAA: Healthcare compliance (for BrainSAIT integration)
# NPHIES: National Platform for Health Insurance Exchange Services

from typing import Dict, List, Any, Optional
from enum import Enum
from datetime import datetime
import re


class ComplianceStandard(str, Enum):
    """Compliance standards"""
    ZATCA = "zatca"
    PDPL = "pdpl"
    HIPAA = "hipaa"
    NPHIES = "nphies"


class ComplianceViolation:
    """Represents a compliance violation"""
    
    def __init__(
        self,
        standard: ComplianceStandard,
        severity: str,
        message: str,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.standard = standard
        self.severity = severity  # 'critical', 'high', 'medium', 'low'
        self.message = message
        self.field = field
        self.details = details or {}
        self.timestamp = datetime.utcnow()


class ComplianceValidator:
    """
    SECURITY: Compliance validation for multiple standards
    Ensures data and operations meet regulatory requirements
    """
    
    def __init__(self):
        self.violations: List[ComplianceViolation] = []
    
    def validate_zatca_invoice(self, invoice: Dict[str, Any]) -> List[ComplianceViolation]:
        """
        ZATCA: Validate invoice meets ZATCA Phase 2 requirements
        
        Required fields:
        - Invoice number (UUID format)
        - Issue date and time
        - Supplier VAT number (15 digits)
        - Customer information
        - Line items with VAT breakdown
        - QR code
        - Cryptographic hash
        
        Args:
            invoice: Invoice data dictionary
        
        Returns:
            List of compliance violations (empty if compliant)
        """
        violations = []
        
        # Check required fields
        required_fields = [
            'invoice_number',
            'issue_date',
            'issue_time',
            'supplier_vat_number',
            'customer_name',
            'line_items',
            'total_excluding_vat',
            'vat_amount',
            'total_including_vat'
        ]
        
        for field in required_fields:
            if field not in invoice or invoice[field] is None:
                violations.append(ComplianceViolation(
                    standard=ComplianceStandard.ZATCA,
                    severity='critical',
                    message=f'Required field missing: {field}',
                    field=field
                ))
        
        # Validate VAT number format (Saudi: 15 digits, starts with 3, ends with 03)
        if 'supplier_vat_number' in invoice:
            vat_number = str(invoice['supplier_vat_number'])
            if not re.match(r'^3\d{12}03$', vat_number):
                violations.append(ComplianceViolation(
                    standard=ComplianceStandard.ZATCA,
                    severity='critical',
                    message='Invalid Saudi VAT number format. Must be 15 digits starting with 3 and ending with 03',
                    field='supplier_vat_number'
                ))
        
        # Validate VAT calculation (15%)
        if all(k in invoice for k in ['total_excluding_vat', 'vat_amount', 'total_including_vat']):
            expected_vat = round(invoice['total_excluding_vat'] * 0.15, 2)
            actual_vat = round(invoice['vat_amount'], 2)
            
            if abs(expected_vat - actual_vat) > 0.01:  # Allow 1 cent tolerance
                violations.append(ComplianceViolation(
                    standard=ComplianceStandard.ZATCA,
                    severity='high',
                    message=f'VAT calculation incorrect. Expected {expected_vat}, got {actual_vat}',
                    field='vat_amount',
                    details={'expected': expected_vat, 'actual': actual_vat}
                ))
        
        # Validate line items
        if 'line_items' in invoice and invoice['line_items']:
            for idx, item in enumerate(invoice['line_items']):
                if 'description' not in item or not item['description']:
                    violations.append(ComplianceViolation(
                        standard=ComplianceStandard.ZATCA,
                        severity='medium',
                        message=f'Line item {idx + 1} missing description',
                        field=f'line_items[{idx}].description'
                    ))
        
        return violations
    
    def validate_pdpl_data(self, data: Dict[str, Any], data_type: str) -> List[ComplianceViolation]:
        """
        PDPL: Validate data meets Saudi Personal Data Protection Law requirements
        
        Requirements:
        - PII must be encrypted at rest
        - Consent for data collection must be documented
        - Data retention policy must be followed
        - Data subject rights must be respected
        
        Args:
            data: Data dictionary
            data_type: Type of data (e.g., 'customer', 'employee', 'outlet')
        
        Returns:
            List of compliance violations
        """
        violations = []
        
        # Check for PII fields that should be encrypted
        pii_fields = [
            'national_id',
            'iqama_id',
            'passport_number',
            'phone',
            'email',
            'address',
            'birth_date'
        ]
        
        for field in pii_fields:
            if field in data and data[field]:
                # Check if data appears to be encrypted (base64-like format)
                value = str(data[field])
                if not self._appears_encrypted(value):
                    violations.append(ComplianceViolation(
                        standard=ComplianceStandard.PDPL,
                        severity='critical',
                        message=f'PII field "{field}" must be encrypted at rest',
                        field=field
                    ))
        
        # Check for consent documentation
        if data_type in ['customer', 'outlet', 'employee']:
            if 'consent_date' not in data or not data.get('consent_date'):
                violations.append(ComplianceViolation(
                    standard=ComplianceStandard.PDPL,
                    severity='high',
                    message='Data collection consent not documented',
                    field='consent_date'
                ))
        
        return violations
    
    def validate_hipaa_phi(self, phi_data: Dict[str, Any]) -> List[ComplianceViolation]:
        """
        HIPAA: Validate Protected Health Information (PHI) compliance
        (For BrainSAIT healthcare integration)
        
        Requirements:
        - PHI must be encrypted
        - Access must be audited
        - Minimum necessary principle
        
        Args:
            phi_data: Protected Health Information data
        
        Returns:
            List of compliance violations
        """
        violations = []
        
        # Check for PHI fields that must be encrypted
        phi_fields = [
            'patient_id',
            'medical_record_number',
            'diagnosis',
            'treatment',
            'prescription',
            'lab_results'
        ]
        
        for field in phi_fields:
            if field in phi_data and phi_data[field]:
                value = str(phi_data[field])
                if not self._appears_encrypted(value):
                    violations.append(ComplianceViolation(
                        standard=ComplianceStandard.HIPAA,
                        severity='critical',
                        message=f'PHI field "{field}" must be encrypted',
                        field=field
                    ))
        
        return violations
    
    def validate_nphies_claim(self, claim: Dict[str, Any]) -> List[ComplianceViolation]:
        """
        NPHIES: Validate insurance claim meets NPHIES requirements
        (For BrainSAIT healthcare integration)
        
        Requirements:
        - FHIR R4 compliant
        - OID namespace compliance
        - Required identifiers present
        
        Args:
            claim: Insurance claim data
        
        Returns:
            List of compliance violations
        """
        violations = []
        
        # Check for required NPHIES identifiers
        required_fields = [
            'claim_id',
            'patient_id',
            'provider_id',
            'service_date',
            'diagnosis_code',
            'service_code'
        ]
        
        for field in required_fields:
            if field not in claim or not claim[field]:
                violations.append(ComplianceViolation(
                    standard=ComplianceStandard.NPHIES,
                    severity='critical',
                    message=f'Required NPHIES field missing: {field}',
                    field=field
                ))
        
        # Validate OID namespace (BrainSAIT: 1.3.6.1.4.1.61026)
        if 'patient_id' in claim:
            patient_id = str(claim['patient_id'])
            if not patient_id.startswith('urn:oid:1.3.6.1.4.1.61026'):
                violations.append(ComplianceViolation(
                    standard=ComplianceStandard.NPHIES,
                    severity='high',
                    message='Patient ID must use BrainSAIT OID namespace (1.3.6.1.4.1.61026)',
                    field='patient_id'
                ))
        
        return violations
    
    def _appears_encrypted(self, value: str) -> bool:
        """
        Check if a value appears to be encrypted
        This is a heuristic check - in production, maintain encryption metadata
        """
        # Check if value looks like base64 encoded data (characteristic of encrypted data)
        if len(value) < 20:  # Encrypted data is typically longer
            return False
        
        # Check for base64-like characters
        base64_pattern = re.compile(r'^[A-Za-z0-9+/=_-]+$')
        return bool(base64_pattern.match(value))
    
    def validate_all(
        self,
        data: Dict[str, Any],
        standards: List[ComplianceStandard]
    ) -> Dict[ComplianceStandard, List[ComplianceViolation]]:
        """
        Validate data against multiple compliance standards
        
        Args:
            data: Data to validate
            standards: List of compliance standards to check
        
        Returns:
            Dictionary mapping standard to list of violations
        """
        results = {}
        
        for standard in standards:
            if standard == ComplianceStandard.ZATCA:
                results[standard] = self.validate_zatca_invoice(data)
            elif standard == ComplianceStandard.PDPL:
                results[standard] = self.validate_pdpl_data(data, data.get('type', 'unknown'))
            elif standard == ComplianceStandard.HIPAA:
                results[standard] = self.validate_hipaa_phi(data)
            elif standard == ComplianceStandard.NPHIES:
                results[standard] = self.validate_nphies_claim(data)
        
        return results
    
    def get_compliance_report(self) -> Dict[str, Any]:
        """
        Generate compliance report
        
        Returns:
            Compliance report with violation summary
        """
        violations_by_standard = {}
        violations_by_severity = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        
        for violation in self.violations:
            # Group by standard
            if violation.standard not in violations_by_standard:
                violations_by_standard[violation.standard] = []
            violations_by_standard[violation.standard].append(violation)
            
            # Count by severity
            violations_by_severity[violation.severity] += 1
        
        return {
            'total_violations': len(self.violations),
            'by_standard': {
                standard: len(viols) 
                for standard, viols in violations_by_standard.items()
            },
            'by_severity': violations_by_severity,
            'is_compliant': len(self.violations) == 0,
            'critical_violations': violations_by_severity['critical']
        }


def get_compliance_validator() -> ComplianceValidator:
    """Get a new compliance validator instance"""
    return ComplianceValidator()
