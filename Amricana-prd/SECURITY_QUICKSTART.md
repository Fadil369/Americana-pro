# Security Quick Start Guide

Get started with SSDP security features in 5 minutes.

## 1. Install Dependencies

```bash
cd packages/audit-logger
pip install -r requirements.txt
```

## 2. Set Environment Variables

```bash
# Required: Set your encryption master key
export ENCRYPTION_MASTER_KEY='your-secure-master-key-here'

# Optional: Set audit log path
export AUDIT_LOG_PATH='/var/log/ssdp/audit'
```

## 3. Add to Your Service

### Import Security Components

```python
import sys
import os

# Add audit logger to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'packages', 'audit-logger', 'src'))

from audit_logger import get_audit_logger, AuditAction, ResourceType, SeverityLevel
from permission_guard import get_permission_guard
from encryption import get_encryption_service
```

### Initialize in FastAPI

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()

# Initialize security components
security = HTTPBearer()
audit_logger = get_audit_logger()
permission_guard = get_permission_guard()

# Set encryption key
os.environ.setdefault('ENCRYPTION_MASTER_KEY', 'your-master-key')
```

### Secure an Endpoint

```python
@app.get("/outlets")
async def get_outlets(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Extract user info (TODO: decode JWT in production)
    user_id = "current_user"
    user_role = "sales_rep"
    
    # 1. Check permission
    if not permission_guard.has_permission(user_role, "read:outlet"):
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/outlets"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # 2. Log data access
    audit_logger.log_data_access(
        user_id=user_id,
        resource_type=ResourceType.OUTLET,
        resource_id="all",
        fields_accessed=["id", "name", "address"]
    )
    
    # 3. Your business logic
    outlets = fetch_outlets_from_db()
    
    return outlets
```

## 4. Common Patterns

### Create Resource

```python
@app.post("/orders")
async def create_order(
    order: Order,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user_id = extract_user_id(credentials)
    user_role = extract_user_role(credentials)
    
    # Check permission
    if not permission_guard.has_permission(user_role, "create:order"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Create order
    order_id = save_order_to_db(order)
    
    # Log creation
    audit_logger.log_modification(
        user_id=user_id,
        action=AuditAction.CREATE,
        resource_type=ResourceType.ORDER,
        resource_id=order_id,
        changes={"outlet_id": order.outlet_id, "total": order.total}
    )
    
    return {"id": order_id, "status": "created"}
```

### Encrypt Sensitive Data

```python
from encryption import get_encryption_service

encryption = get_encryption_service()

# Before saving to database
customer = {
    "name": "Ahmed Hassan",
    "national_id": "1234567890",  # PII
    "phone": "+966501234567",     # PII
    "credit_limit": 50000.0       # Financial
}

# Encrypt PII and financial fields
encrypted_customer = encryption.encrypt_pii(customer)
encrypted_customer = encryption.encrypt_financial(encrypted_customer)

# Save to database
save_to_db(encrypted_customer)

# When retrieving, decrypt
retrieved = fetch_from_db(customer_id)
decrypted = encryption.decrypt_dict(retrieved, ['national_id', 'phone', 'credit_limit'])
```

### Validate Compliance

```python
from compliance import get_compliance_validator, ComplianceStandard

validator = get_compliance_validator()

# Before processing invoice
violations = validator.validate_zatca_invoice(invoice_data)

if violations:
    critical = [v for v in violations if v.severity == 'critical']
    if critical:
        raise HTTPException(
            status_code=400,
            detail=f"ZATCA compliance violations: {[v.message for v in critical]}"
        )
```

## 5. Admin Endpoints

### Get Audit Logs

```python
@app.get("/security/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user_id = extract_user_id(credentials)
    user_role = extract_user_role(credentials)
    
    # Admin only
    if user_role not in ["super_admin", "regional_manager"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    logs = audit_logger.get_logs(limit=limit)
    
    return {
        "total": len(logs),
        "logs": [log.to_dict() for log in logs]
    }
```

### Get Role Permissions

```python
@app.get("/security/permissions/{role}")
async def get_role_permissions(
    role: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    permissions = permission_guard.get_user_permissions(role)
    return {"role": role, "permissions": permissions}
```

## 6. Testing

### Run Tests

```bash
cd packages/audit-logger
pytest tests/ -v
```

### Test Your Endpoint

```bash
# With curl
curl -X GET http://localhost:8000/outlets \
  -H "Authorization: Bearer your-jwt-token"

# With Python requests
import requests

headers = {"Authorization": "Bearer your-jwt-token"}
response = requests.get("http://localhost:8000/outlets", headers=headers)
print(response.json())
```

## 7. User Roles & Permissions

Quick reference:

| Role | Can Do |
|------|--------|
| **super_admin** | Everything |
| **regional_manager** | Manage territory, view reports, approve orders |
| **sales_rep** | Create orders, register outlets, view products |
| **driver** | View/update deliveries, view routes |
| **finance_officer** | Manage invoices/payments, view financials |
| **outlet_owner** | View own orders/invoices, create orders |

## 8. Common Errors

### "Insufficient permissions"
- Check user role has required permission
- Verify permission format: `"action:resource"` (e.g., `"read:outlet"`)

### "ImportError: attempted relative import"
- Ensure audit-logger package is in Python path
- Use the sys.path.insert() shown in step 3

### "Master encryption key not provided"
- Set `ENCRYPTION_MASTER_KEY` environment variable
- Or pass to `get_encryption_service(master_key="...")`

### Rate limit exceeded
- Default: 100 requests/minute per IP
- Implement exponential backoff in client

## 9. Production Checklist

Before deploying to production:

- [ ] Set strong `ENCRYPTION_MASTER_KEY` (min 32 characters)
- [ ] Store secrets in AWS Secrets Manager or similar
- [ ] Enable TLS 1.3 on all services
- [ ] Implement JWT token validation
- [ ] Configure database persistence for audit logs
- [ ] Set up log aggregation (ELK, Splunk, etc.)
- [ ] Enable rate limiting
- [ ] Review and test all permission configurations
- [ ] Test compliance validators with real data
- [ ] Set up security monitoring and alerts
- [ ] Document incident response procedures

## 10. Getting Help

- **Security Issues**: security@brainsait.com
- **Full Documentation**: See [SECURITY.md](SECURITY.md)
- **Package README**: [packages/audit-logger/README.md](packages/audit-logger/README.md)

---

**Quick Links**:
- [Full Security Documentation](SECURITY.md)
- [API Security Instructions](.instructions/api-instructions.md)
- [Test Examples](packages/audit-logger/tests/)
