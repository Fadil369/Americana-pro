# Audit Logger Package

BRAINSAIT Security, Compliance & Data Privacy Layer for SSDP Platform

## Overview

This package provides comprehensive security, audit logging, RBAC (Role-Based Access Control), encryption, and compliance validation for the Smart Sweet Distribution Platform (SSDP).

## Features

### 1. Audit Logging
- **Comprehensive tracking** of all user actions and data access
- **7-year retention** policy (HIPAA/PDPL compliant)
- **Tamper-proof logs** with SHA-256 checksums
- **Field-level access tracking** for sensitive data
- **Export capabilities** (JSON/CSV) for compliance reporting

### 2. Role-Based Access Control (RBAC)
- **PermissionGuard** class for enforcing permissions
- **6 user roles**: super_admin, regional_manager, sales_rep, driver, finance_officer, outlet_owner
- **Granular permissions** with action:resource format (e.g., "read:outlet")
- **Automatic audit logging** of all access attempts
- **Resource ownership validation** for outlet_owner role

### 3. Encryption
- **AES-256 encryption** for data at rest
- **Field-level encryption** for PII and financial data
- **PBKDF2 key derivation** for secure key management
- **PII/PHI encryption helpers** for compliance

### 4. Compliance Validation
- **ZATCA**: Saudi e-invoicing Phase 2 compliance
- **PDPL**: Saudi Personal Data Protection Law
- **HIPAA**: Healthcare data protection (for BrainSAIT integration)
- **NPHIES**: Saudi health insurance exchange (for BrainSAIT integration)

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Audit Logging

```python
from audit_logger import get_audit_logger, AuditAction, ResourceType

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

# Log modifications
audit_logger.log_modification(
    user_id="user123",
    action=AuditAction.UPDATE,
    resource_type=ResourceType.ORDER,
    resource_id="ORD001",
    changes={"status": "completed"},
    ip_address="192.168.1.1"
)

# Log security events
audit_logger.log_security_event(
    user_id="user456",
    event_type="failed_login",
    details={"reason": "invalid_password"},
    severity=SeverityLevel.WARNING
)

# Query logs
logs = audit_logger.get_logs(
    user_id="user123",
    resource_type=ResourceType.OUTLET,
    from_date=datetime(2024, 1, 1),
    limit=100
)

# Export logs for compliance
logs_json = audit_logger.export_logs(
    from_date=datetime(2024, 1, 1),
    to_date=datetime(2024, 12, 31),
    format="json"
)
```

### Permission Guard (RBAC)

```python
from audit_logger import get_permission_guard, ResourceType

# Initialize permission guard
permission_guard = get_permission_guard()

# Check if user has permission
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

# Get all permissions for a role
permissions = permission_guard.get_user_permissions("sales_rep")
```

### Encryption

```python
from audit_logger import get_encryption_service

# Initialize encryption service (requires ENCRYPTION_MASTER_KEY env var)
encryption = get_encryption_service()

# Encrypt/decrypt data
encrypted = encryption.encrypt("sensitive data")
decrypted = encryption.decrypt(encrypted)

# Encrypt PII fields
customer_data = {
    "name": "Ahmed Hassan",
    "national_id": "1234567890",
    "phone": "+966501234567",
    "email": "ahmed@example.com"
}
encrypted_data = encryption.encrypt_pii(customer_data)

# Encrypt financial fields
financial_data = {
    "credit_limit": 50000.0,
    "current_balance": 12500.0,
    "bank_account": "SA1234567890"
}
encrypted_financial = encryption.encrypt_financial(financial_data)
```

### Compliance Validation

```python
from audit_logger.compliance import get_compliance_validator, ComplianceStandard

validator = get_compliance_validator()

# Validate ZATCA invoice
invoice = {
    "invoice_number": "INV-2024-001",
    "issue_date": "2024-01-15",
    "issue_time": "10:30:00",
    "supplier_vat_number": "310123456789003",
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
    "phone": "encrypted_value_here",
    "consent_date": "2024-01-01"
}

pdpl_violations = validator.validate_pdpl_data(customer, "customer")

# Get compliance report
report = validator.get_compliance_report()
print(f"Total violations: {report['total_violations']}")
print(f"Is compliant: {report['is_compliant']}")
```

### FastAPI Integration

```python
from fastapi import FastAPI, Depends
from audit_logger.middleware import SecurityMiddleware, require_permission
from audit_logger import get_audit_logger, ResourceType

app = FastAPI()

# Add security middleware
app.add_middleware(SecurityMiddleware)

# Secure endpoint with permission check
@app.get("/outlets")
async def get_outlets(
    user = Depends(require_permission("read:outlet"))
):
    # User has been validated and logged
    audit_logger = get_audit_logger()
    # Your endpoint logic here
    return {"outlets": [...]}
```

## Roles and Permissions

### Super Admin
- **Permission**: `*` (all permissions)
- **Access**: Full platform access

### Regional Manager
- **Permissions**: 
  - read:outlet, read:order, read:sales_rep, read:driver, read:vehicle, read:report, read:invoice, read:financial
  - create:sales_rep, update:sales_rep
  - create:route, update:route
  - approve:order
- **Access**: Territory management and analytics

### Sales Rep
- **Permissions**:
  - read:outlet, read:product, read:route, read:sales_rep, read:order
  - create:order, update:order
  - create:outlet
- **Access**: Field operations and order management

### Driver
- **Permissions**:
  - read:route, read:order, read:vehicle, read:outlet
  - update:order (delivery status)
- **Access**: Route and delivery management

### Finance Officer
- **Permissions**:
  - read:invoice, create:invoice, update:invoice
  - read:payment, create:payment
  - read:order, read:outlet, read:financial, read:report
  - export:financial
- **Access**: Financial operations and ZATCA compliance

### Outlet Owner
- **Permissions**:
  - read:outlet, read:order, read:invoice, read:payment, read:product
  - create:order
- **Access**: Self-service portal (own resources only)

## Environment Variables

```bash
# Encryption master key (required)
ENCRYPTION_MASTER_KEY=your-secure-master-key-here

# Audit log storage path (optional, defaults to /var/log/ssdp/audit)
AUDIT_LOG_PATH=/var/log/ssdp/audit
```

## Compliance Standards

### ZATCA (Saudi E-Invoicing)
- Phase 2 compliance validation
- VAT number format validation
- VAT calculation verification (15%)
- Required field validation
- QR code and hash validation

### PDPL (Saudi Personal Data Protection Law)
- PII encryption enforcement
- Consent documentation validation
- Data retention policy enforcement
- Data subject rights compliance

### HIPAA (Healthcare Data Protection)
- PHI encryption enforcement
- Access audit logging
- Minimum necessary principle
- (For BrainSAIT healthcare integration)

### NPHIES (Saudi Health Insurance Exchange)
- FHIR R4 compliance
- OID namespace validation (BrainSAIT: 1.3.6.1.4.1.61026)
- Required identifier validation
- (For BrainSAIT healthcare integration)

## Security Best Practices

1. **Always encrypt PII/PHI**: Use `encrypt_pii()` or `encrypt_financial()` before storing
2. **Log all access**: Use audit logger for all data access and modifications
3. **Check permissions**: Use PermissionGuard before allowing access
4. **Validate compliance**: Run compliance validators before processing sensitive operations
5. **Use TLS 1.3**: All data in transit must use TLS 1.3
6. **Rotate keys**: Regularly rotate encryption keys
7. **Review logs**: Regularly review audit logs for suspicious activity
8. **Maintain retention**: Keep audit logs for 7 years (HIPAA/PDPL requirement)

## License

MIT License - See LICENSE file for details

## Support

For security issues, please contact: security@brainsait.com
For general support: info@brainsait.com
