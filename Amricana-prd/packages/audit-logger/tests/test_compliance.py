# BRAINSAIT: Compliance validation tests
# SECURITY: Test suite for ZATCA, PDPL, HIPAA, NPHIES compliance

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import pytest
from compliance import (
    ComplianceValidator,
    ComplianceStandard,
    ComplianceViolation
)


class TestZATCACompliance:
    """Test ZATCA e-invoicing compliance validation"""
    
    def test_valid_zatca_invoice(self):
        """Test that valid ZATCA invoice passes validation"""
        validator = ComplianceValidator()
        
        valid_invoice = {
            "invoice_number": "INV-2024-001",
            "issue_date": "2024-01-15",
            "issue_time": "10:30:00",
            "supplier_vat_number": "301234567890003",  # Valid format: starts with 3, ends with 03, 15 digits
            "customer_name": "Al-Noor Sweets",
            "line_items": [
                {
                    "description": "Baklava",
                    "quantity": 10,
                    "unit_price": 25.0,
                    "vat_rate": 0.15,
                    "line_total": 250.0
                }
            ],
            "total_excluding_vat": 1000.0,
            "vat_amount": 150.0,
            "total_including_vat": 1150.0
        }
        
        violations = validator.validate_zatca_invoice(valid_invoice)
        assert len(violations) == 0, f"Valid invoice should have no violations, got: {[v.message for v in violations]}"
    
    def test_missing_required_fields(self):
        """Test that missing required fields are detected"""
        validator = ComplianceValidator()
        
        incomplete_invoice = {
            "invoice_number": "INV-2024-001",
            # Missing other required fields
        }
        
        violations = validator.validate_zatca_invoice(incomplete_invoice)
        assert len(violations) > 0, "Missing required fields should be detected"
        assert any(v.severity == 'critical' for v in violations)
    
    def test_invalid_vat_number_format(self):
        """Test that invalid VAT number format is detected"""
        validator = ComplianceValidator()
        
        invoice_with_invalid_vat = {
            "invoice_number": "INV-2024-001",
            "issue_date": "2024-01-15",
            "issue_time": "10:30:00",
            "supplier_vat_number": "123456789",  # Invalid format
            "customer_name": "Test Customer",
            "line_items": [],
            "total_excluding_vat": 1000.0,
            "vat_amount": 150.0,
            "total_including_vat": 1150.0
        }
        
        violations = validator.validate_zatca_invoice(invoice_with_invalid_vat)
        vat_violations = [v for v in violations if v.field == 'supplier_vat_number']
        assert len(vat_violations) > 0, "Invalid VAT number should be detected"
    
    def test_incorrect_vat_calculation(self):
        """Test that incorrect VAT calculation is detected"""
        validator = ComplianceValidator()
        
        invoice_with_wrong_vat = {
            "invoice_number": "INV-2024-001",
            "issue_date": "2024-01-15",
            "issue_time": "10:30:00",
            "supplier_vat_number": "310123456789003",
            "customer_name": "Test Customer",
            "line_items": [{"description": "Test", "quantity": 1, "unit_price": 100}],
            "total_excluding_vat": 1000.0,
            "vat_amount": 100.0,  # Should be 150.0 (15%)
            "total_including_vat": 1100.0
        }
        
        violations = validator.validate_zatca_invoice(invoice_with_wrong_vat)
        vat_calc_violations = [v for v in violations if 'VAT calculation' in v.message]
        assert len(vat_calc_violations) > 0, "Incorrect VAT calculation should be detected"


class TestPDPLCompliance:
    """Test PDPL (Saudi Personal Data Protection Law) compliance"""
    
    def test_unencrypted_pii_detected(self):
        """Test that unencrypted PII is detected"""
        validator = ComplianceValidator()
        
        data_with_plain_pii = {
            "name": "Ahmed Hassan",
            "national_id": "1234567890",  # Not encrypted
            "phone": "+966501234567",     # Not encrypted
            "email": "ahmed@example.com"  # Not encrypted
        }
        
        violations = validator.validate_pdpl_data(data_with_plain_pii, "customer")
        pii_violations = [v for v in violations if 'encrypted' in v.message]
        assert len(pii_violations) > 0, "Unencrypted PII should be detected"
    
    def test_encrypted_pii_passes(self):
        """Test that encrypted PII passes validation"""
        validator = ComplianceValidator()
        
        data_with_encrypted_pii = {
            "name": "Ahmed Hassan",
            "national_id": "Z0FBQUFBQm5YUFhfX1U2YzBZTkJnS2ZHZWRqVmFCZUZKaWxnS0Y=",  # Base64-like encrypted
            "phone": "Z0FBQUFBQm5YUFhfX1U2YzBZTkJnS2ZHZWRqVmFCZUZKaWxnS0Y=",
            "consent_date": "2024-01-01"
        }
        
        violations = validator.validate_pdpl_data(data_with_encrypted_pii, "customer")
        pii_violations = [v for v in violations if 'encrypted' in v.message]
        assert len(pii_violations) == 0, "Encrypted PII should pass validation"
    
    def test_missing_consent_detected(self):
        """Test that missing consent documentation is detected"""
        validator = ComplianceValidator()
        
        data_without_consent = {
            "name": "Test Customer",
            "national_id": "Z0FBQUFBQm5YUFhfX1U2YzBZTkJnS2ZHZWRqVmFCZUZKaWxnS0Y="
            # Missing consent_date
        }
        
        violations = validator.validate_pdpl_data(data_without_consent, "customer")
        consent_violations = [v for v in violations if 'consent' in v.message.lower()]
        assert len(consent_violations) > 0, "Missing consent should be detected"


class TestHIPAACompliance:
    """Test HIPAA compliance (for BrainSAIT healthcare integration)"""
    
    def test_unencrypted_phi_detected(self):
        """Test that unencrypted PHI is detected"""
        validator = ComplianceValidator()
        
        phi_data = {
            "patient_id": "PT123456",  # Not encrypted
            "diagnosis": "Type 2 Diabetes",  # Not encrypted
            "prescription": "Metformin 500mg"  # Not encrypted
        }
        
        violations = validator.validate_hipaa_phi(phi_data)
        assert len(violations) > 0, "Unencrypted PHI should be detected"
        assert all(v.severity == 'critical' for v in violations)
    
    def test_encrypted_phi_passes(self):
        """Test that encrypted PHI passes validation"""
        validator = ComplianceValidator()
        
        encrypted_phi = {
            "patient_id": "Z0FBQUFBQm5YUFhfX1U2YzBZTkJnS2ZHZWRqVmFCZUZKaWxnS0Y=",
            "diagnosis": "Z0FBQUFBQm5YUFhfX1U2YzBZTkJnS2ZHZWRqVmFCZUZKaWxnS0Y=",
            "prescription": "Z0FBQUFBQm5YUFhfX1U2YzBZTkJnS2ZHZWRqVmFCZUZKaWxnS0Y="
        }
        
        violations = validator.validate_hipaa_phi(encrypted_phi)
        phi_violations = [v for v in violations if 'PHI' in v.message]
        assert len(phi_violations) == 0, "Encrypted PHI should pass validation"


class TestNPHIESCompliance:
    """Test NPHIES compliance (Saudi health insurance exchange)"""
    
    def test_valid_nphies_claim(self):
        """Test that valid NPHIES claim passes validation"""
        validator = ComplianceValidator()
        
        valid_claim = {
            "claim_id": "CLM-2024-001",
            "patient_id": "urn:oid:1.3.6.1.4.1.61026.2.1:SA123456789",
            "provider_id": "PRV-001",
            "service_date": "2024-01-15",
            "diagnosis_code": "E11",
            "service_code": "99213"
        }
        
        violations = validator.validate_nphies_claim(valid_claim)
        assert len(violations) == 0, "Valid NPHIES claim should have no violations"
    
    def test_missing_required_fields(self):
        """Test that missing required fields are detected"""
        validator = ComplianceValidator()
        
        incomplete_claim = {
            "claim_id": "CLM-2024-001"
            # Missing other required fields
        }
        
        violations = validator.validate_nphies_claim(incomplete_claim)
        assert len(violations) > 0, "Missing required fields should be detected"
    
    def test_invalid_oid_namespace(self):
        """Test that invalid OID namespace is detected"""
        validator = ComplianceValidator()
        
        claim_with_invalid_oid = {
            "claim_id": "CLM-2024-001",
            "patient_id": "PT123456",  # Not using BrainSAIT OID namespace
            "provider_id": "PRV-001",
            "service_date": "2024-01-15",
            "diagnosis_code": "E11",
            "service_code": "99213"
        }
        
        violations = validator.validate_nphies_claim(claim_with_invalid_oid)
        oid_violations = [v for v in violations if 'OID' in v.message]
        assert len(oid_violations) > 0, "Invalid OID namespace should be detected"


class TestComplianceReport:
    """Test compliance reporting"""
    
    def test_compliance_report_generation(self):
        """Test that compliance report is generated correctly"""
        validator = ComplianceValidator()
        
        # Add some test violations
        validator.violations = [
            ComplianceViolation(
                standard=ComplianceStandard.ZATCA,
                severity='critical',
                message='Test violation 1'
            ),
            ComplianceViolation(
                standard=ComplianceStandard.PDPL,
                severity='high',
                message='Test violation 2'
            ),
            ComplianceViolation(
                standard=ComplianceStandard.ZATCA,
                severity='medium',
                message='Test violation 3'
            )
        ]
        
        report = validator.get_compliance_report()
        
        assert report['total_violations'] == 3
        assert report['by_severity']['critical'] == 1
        assert report['by_severity']['high'] == 1
        assert report['by_severity']['medium'] == 1
        assert report['is_compliant'] is False
        assert report['critical_violations'] == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
