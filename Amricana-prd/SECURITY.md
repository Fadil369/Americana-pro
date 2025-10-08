# SSDP Security, Compliance & Data Privacy

## Overview

The Smart Sweet Distribution Platform (SSDP) implements enterprise-grade security with comprehensive audit logging, role-based access control (RBAC), data encryption, and multi-standard compliance validation.

## Security Architecture

### 1. Audit Logging System

**Location**: `packages/audit-logger/`

#### Features
- **Comprehensive Tracking**: All user actions, data access, and system changes are logged
- **Tamper Detection**: SHA-256 checksums ensure log integrity
- **7-Year Retention**: Complies with HIPAA and PDPL requirements
- **Field-Level Tracking**: Logs which specific fields were accessed
- **Export Capabilities**: JSON/CSV exports for compliance reporting

#### Log Fields
- Unique log ID (UUID)
- Timestamp (ISO 8601)
- User ID
- Action type (create, read, update, delete, etc.)
- Resource type (outlet, order, invoice, etc.)
- Resource ID
- IP address
- User agent
- Details (JSON)
- Severity level (info, warning, error, critical)
- Checksum (SHA-256)

#### Usage Example
```python
from audit_logger import get_audit_logger, AuditAction, ResourceType

audit_logger = get_audit_logger()

# Log data access
audit_logger.log_data_access(
    user_id="user123",
    resource_type=ResourceType.OUTLET,
    resource_id="OUT001",
    fields_accessed=["name", "credit_limit"],
    ip_address="192.168.1.1"
)

# Log modifications
audit_logger.log_modification(
    user_id="user123",
    action=AuditAction.UPDATE,
    resource_type=ResourceType.ORDER,
    resource_id="ORD001",
    changes={"status": "completed"}
)

# Log security events
audit_logger.log_security_event(
    user_id="user456",
    event_type="failed_login",
    details={"reason": "invalid_password"},
    severity=SeverityLevel.WARNING
)
```

### 2. Role-Based Access Control (RBAC)

**Location**: `packages/audit-logger/src/permission_guard.py`

#### User Roles

| Role | Permissions | Description |
|------|------------|-------------|
| **super_admin** | `*` (all) | Full platform access |
| **regional_manager** | read:outlet, read:order, read:sales_rep, read:driver, read:vehicle, read:report, read:invoice, read:financial, create:sales_rep, update:sales_rep, create:route, update:route, approve:order | Territory management and analytics |
| **sales_rep** | read:outlet, read:product, create:order, read:order, update:order, read:route, create:outlet, read:sales_rep | Field operations and order management |
| **driver** | read:route, read:order, update:order, read:vehicle, read:outlet | Route and delivery management |
| **finance_officer** | read:invoice, create:invoice, update:invoice, read:payment, create:payment, read:order, read:outlet, read:financial, export:financial, read:report | Financial operations and ZATCA compliance |
| **outlet_owner** | read:outlet, read:order, create:order, read:invoice, read:payment, read:product | Self-service portal (own resources only) |

#### Permission Format
Permissions follow the format: `action:resource`

Examples:
- `read:outlet` - Read outlet information
- `create:order` - Create new orders
- `update:invoice` - Update invoices
- `approve:order` - Approve orders

#### Usage Example
```python
from permission_guard import get_permission_guard, ResourceType

permission_guard = get_permission_guard()

# Check permission
has_access = permission_guard.has_permission("sales_rep", "read:outlet")

# Check and log access attempt
granted = permission_guard.check_access(
    user_id="user123",
    user_role="sales_rep",
    action="read",
    resource_type=ResourceType.OUTLET,
    resource_id="OUT001",
    ip_address="192.168.1.1"
)

if not granted:
    raise HTTPException(status_code=403, detail="Insufficient permissions")
```

### 3. Data Encryption

**Location**: `packages/audit-logger/src/encryption.py`

#### Features
- **AES-256 Encryption**: Industry-standard encryption for data at rest
- **PBKDF2 Key Derivation**: Secure key management with 100,000 iterations
- **Field-Level Encryption**: Encrypt specific fields in database records
- **PII/PHI Helpers**: Pre-configured encryption for common sensitive fields

#### Encrypted Field Types

**PII (Personally Identifiable Information)**:
- National ID
- Iqama ID
- Phone numbers
- Email addresses
- Physical addresses
- Birth dates
- Passport numbers
- Tax IDs

**Financial Data**:
- Credit limits
- Current balances
- Bank account numbers
- Credit card numbers
- IBAN codes
- SWIFT codes

#### Usage Example
```python
from encryption import get_encryption_service
import os

# Set encryption key (use secure key management in production)
os.environ['ENCRYPTION_MASTER_KEY'] = 'your-secure-key'

encryption = get_encryption_service()

# Encrypt/decrypt data
encrypted = encryption.encrypt("sensitive data")
decrypted = encryption.decrypt(encrypted)

# Encrypt PII fields in customer data
customer_data = {
    "name": "Ahmed Hassan",
    "national_id": "1234567890",
    "phone": "+966501234567",
    "email": "ahmed@example.com"
}
encrypted_customer = encryption.encrypt_pii(customer_data)

# Encrypt financial fields
financial_data = {
    "credit_limit": 50000.0,
    "bank_account": "SA1234567890"
}
encrypted_financial = encryption.encrypt_financial(financial_data)
```

### 4. Compliance Validation

**Location**: `packages/audit-logger/src/compliance.py`

#### Supported Standards

##### ZATCA (Saudi E-Invoicing Phase 2)
- VAT number format validation (15 digits, starts with 3, ends with 03)
- VAT calculation verification (15%)
- Required field validation
- QR code format validation
- Invoice integrity checks

##### PDPL (Saudi Personal Data Protection Law)
- PII encryption enforcement
- Consent documentation validation
- Data retention policy compliance
- Data subject rights validation

##### HIPAA (Healthcare Data Protection)
- PHI encryption enforcement
- Access audit logging
- Minimum necessary principle
- (For BrainSAIT healthcare integration)

##### NPHIES (Saudi Health Insurance Exchange)
- FHIR R4 compliance
- OID namespace validation (BrainSAIT: 1.3.6.1.4.1.61026)
- Required identifier validation
- (For BrainSAIT healthcare integration)

#### Usage Example
```python
from compliance import get_compliance_validator, ComplianceStandard

validator = get_compliance_validator()

# Validate ZATCA invoice
invoice = {
    "invoice_number": "INV-2024-001",
    "issue_date": "2024-01-15",
    "issue_time": "10:30:00",
    "supplier_vat_number": "301234567890003",
    "customer_name": "Al-Noor Sweets",
    "line_items": [...],
    "total_excluding_vat": 1000.0,
    "vat_amount": 150.0,
    "total_including_vat": 1150.0
}

violations = validator.validate_zatca_invoice(invoice)
if violations:
    for v in violations:
        print(f"{v.severity}: {v.message}")

# Validate PDPL compliance
customer = {
    "national_id": "encrypted_value_here",
    "consent_date": "2024-01-01"
}
pdpl_violations = validator.validate_pdpl_data(customer, "customer")

# Get compliance report
report = validator.get_compliance_report()
print(f"Is compliant: {report['is_compliant']}")
```

## Service Integration

### Distribution Service
- **Security**: All endpoints require authentication
- **Permissions**: Role-based access to orders, outlets, analytics
- **Audit Logging**: All data access and modifications logged
- **Endpoints**:
  - `GET /orders` - Requires `read:order` permission
  - `POST /orders` - Requires `create:order` permission
  - `GET /outlets` - Requires `read:outlet` permission
  - `GET /security/audit-logs` - Admin only

### Saudi API Service
- **Security**: Commercial registration validation secured
- **Permissions**: Only sales reps can verify outlets (`create:outlet`)
- **Audit Logging**: All Wathq API calls logged
- **Endpoints**:
  - `GET /national-address/{cr_number}` - Requires `create:outlet` permission
  - `POST /verify-outlet` - Requires `create:outlet` permission

### AI Forecasting Service
- **Security**: Forecasts restricted to managers
- **Permissions**: Requires `read:report` permission
- **Audit Logging**: All forecast access logged
- **Endpoints**:
  - `GET /forecast/demand` - Requires `read:report` permission
  - `GET /forecast/products` - Requires `read:report` permission

## Security Best Practices

### For Developers

1. **Always Log Data Access**
   ```python
   audit_logger.log_data_access(
       user_id=user_id,
       resource_type=ResourceType.OUTLET,
       resource_id=resource_id,
       fields_accessed=["name", "phone"]
   )
   ```

2. **Check Permissions Before Operations**
   ```python
   if not permission_guard.has_permission(user_role, "read:outlet"):
       raise HTTPException(status_code=403, detail="Insufficient permissions")
   ```

3. **Encrypt Sensitive Data**
   ```python
   # Before storing in database
   encrypted_data = encryption.encrypt_pii(customer_data)
   ```

4. **Validate Compliance**
   ```python
   violations = validator.validate_zatca_invoice(invoice)
   if violations:
       raise HTTPException(status_code=400, detail="Compliance violation")
   ```

5. **Never Log Sensitive Data**
   ```python
   # ❌ BAD
   logger.info(f"Customer data: {customer}")
   
   # ✅ GOOD
   logger.info(f"Customer created: {customer_id}")
   ```

### For Administrators

1. **Set Encryption Keys Securely**
   - Use environment variables
   - Never commit keys to source control
   - Rotate keys regularly
   - Use AWS Secrets Manager or similar in production

2. **Review Audit Logs Regularly**
   - Check for unauthorized access attempts
   - Monitor suspicious patterns
   - Export logs for external analysis

3. **Enforce TLS 1.3**
   - All API communication must use TLS 1.3
   - Disable older TLS versions
   - Use strong cipher suites

4. **Monitor Compliance**
   - Run compliance validators regularly
   - Address critical violations immediately
   - Document remediation actions

## Environment Variables

### Required
```bash
# Encryption master key (REQUIRED)
ENCRYPTION_MASTER_KEY=your-secure-master-key-here
```

### Optional
```bash
# Audit log storage path (default: /var/log/ssdp/audit)
AUDIT_LOG_PATH=/var/log/ssdp/audit

# JWT secret for token validation
JWT_SECRET=your-jwt-secret-here

# Token expiration (default: 3600 seconds)
JWT_EXPIRATION=3600
```

## Testing

Run security tests:
```bash
cd packages/audit-logger
pip install -r requirements.txt
pytest tests/ -v
```

Test coverage:
- 15 tests for audit logging
- 13 tests for compliance validation
- 14 tests for RBAC/permission guard
- **Total: 42 tests, all passing ✓**

## Compliance Checklist

### ZATCA Compliance ✓
- [x] Phase 2 e-invoicing validation
- [x] VAT number format validation
- [x] VAT calculation verification (15%)
- [x] Required field validation
- [x] QR code generation (see `packages/saudi-compliance/`)

### PDPL Compliance ✓
- [x] PII encryption enforcement
- [x] Consent documentation validation
- [x] 7-year audit log retention
- [x] Data subject rights framework

### HIPAA Compliance ✓
- [x] PHI encryption enforcement
- [x] Access audit logging
- [x] 7-year audit log retention
- [x] Tamper-proof audit logs

### NPHIES Compliance ✓
- [x] FHIR R4 resource validation
- [x] OID namespace validation
- [x] Required identifier validation
- [x] (For BrainSAIT healthcare integration)

## Security Incidents

### Reporting
Security issues should be reported to: **security@brainsait.com**

### Response Time
- Critical: 1 hour
- High: 4 hours
- Medium: 24 hours
- Low: 1 week

## Audit Log Retention

Per HIPAA and PDPL requirements:
- **Retention Period**: 7 years
- **Storage**: Encrypted at rest
- **Access**: Admin only
- **Export**: Available for compliance audits

## Additional Resources

- [Audit Logger README](packages/audit-logger/README.md)
- [API Security Instructions](.instructions/api-instructions.md)
- [BrainSAIT Copilot Instructions](.github/copilot-instructions.md)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Contact**: security@brainsait.com
