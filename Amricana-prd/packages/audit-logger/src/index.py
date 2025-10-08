# BRAINSAIT: Audit logger package for SSDP platform
# HIPAA: Comprehensive audit logging for compliance
# SECURITY: Tracks all data access and modifications

from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json
import uuid
import hashlib

class AuditAction(str, Enum):
    """Audit action types"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    CHECK_IN = "check_in"
    CHECK_OUT = "check_out"
    APPROVE = "approve"
    REJECT = "reject"

class ResourceType(str, Enum):
    """Resource types for audit logging"""
    USER = "user"
    SALES_REP = "sales_rep"
    OUTLET = "outlet"
    ORDER = "order"
    INVOICE = "invoice"
    PAYMENT = "payment"
    PRODUCT = "product"
    VISIT = "visit"
    ROUTE = "route"
    CREDIT_LIMIT = "credit_limit"
    REPORT = "report"

class SeverityLevel(str, Enum):
    """Log severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AuditLog:
    """
    HIPAA: Audit log entry for compliance tracking
    Records all access to sensitive data and system operations
    """
    
    def __init__(
        self,
        user_id: str,
        action: AuditAction,
        resource_type: ResourceType,
        resource_id: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        severity: SeverityLevel = SeverityLevel.INFO
    ):
        self.id = str(uuid.uuid4())
        self.timestamp = datetime.now()
        self.user_id = user_id
        self.action = action
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.details = details or {}
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.severity = severity
        self.checksum = self._generate_checksum()
    
    def _generate_checksum(self) -> str:
        """Generate checksum for audit log integrity"""
        data = f"{self.timestamp.isoformat()}{self.user_id}{self.action}{self.resource_type}{self.resource_id}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert audit log to dictionary"""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "user_id": self.user_id,
            "action": self.action.value,
            "resource_type": self.resource_type.value,
            "resource_id": self.resource_id,
            "details": self.details,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "severity": self.severity.value,
            "checksum": self.checksum
        }
    
    def to_json(self) -> str:
        """Convert audit log to JSON string"""
        return json.dumps(self.to_dict())

class AuditLogger:
    """
    HIPAA: Central audit logging service
    Maintains comprehensive audit trail for compliance
    """
    
    def __init__(self, storage_backend: Optional[Any] = None):
        self.storage = storage_backend
        self.logs: List[AuditLog] = []
    
    def log(
        self,
        user_id: str,
        action: AuditAction,
        resource_type: ResourceType,
        resource_id: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        severity: SeverityLevel = SeverityLevel.INFO
    ) -> AuditLog:
        """Create and store audit log entry"""
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            severity=severity
        )
        
        self.logs.append(audit_log)
        
        # Store in backend if available
        if self.storage:
            self.storage.save(audit_log)
        
        return audit_log
    
    def log_data_access(
        self,
        user_id: str,
        resource_type: ResourceType,
        resource_id: str,
        fields_accessed: Optional[List[str]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """HIPAA: Log access to sensitive data"""
        return self.log(
            user_id=user_id,
            action=AuditAction.READ,
            resource_type=resource_type,
            resource_id=resource_id,
            details={"fields_accessed": fields_accessed} if fields_accessed else None,
            ip_address=ip_address,
            severity=SeverityLevel.INFO
        )
    
    def log_data_modification(
        self,
        user_id: str,
        action: AuditAction,
        resource_type: ResourceType,
        resource_id: str,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """HIPAA: Log modifications to data"""
        return self.log(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details={"changes": changes} if changes else None,
            ip_address=ip_address,
            severity=SeverityLevel.WARNING if action == AuditAction.DELETE else SeverityLevel.INFO
        )
    
    def log_security_event(
        self,
        user_id: str,
        event_type: str,
        details: Optional[Dict[str, Any]] = None,
        severity: SeverityLevel = SeverityLevel.WARNING
    ) -> AuditLog:
        """SECURITY: Log security-related events"""
        return self.log(
            user_id=user_id,
            action=AuditAction.LOGIN if event_type == "login" else AuditAction.LOGOUT,
            resource_type=ResourceType.USER,
            resource_id=user_id,
            details={"event_type": event_type, **(details or {})},
            severity=severity
        )
    
    def get_logs(
        self,
        user_id: Optional[str] = None,
        resource_type: Optional[ResourceType] = None,
        resource_id: Optional[str] = None,
        action: Optional[AuditAction] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[AuditLog]:
        """Query audit logs with filters"""
        filtered_logs = self.logs
        
        if user_id:
            filtered_logs = [log for log in filtered_logs if log.user_id == user_id]
        
        if resource_type:
            filtered_logs = [log for log in filtered_logs if log.resource_type == resource_type]
        
        if resource_id:
            filtered_logs = [log for log in filtered_logs if log.resource_id == resource_id]
        
        if action:
            filtered_logs = [log for log in filtered_logs if log.action == action]
        
        if from_date:
            filtered_logs = [log for log in filtered_logs if log.timestamp >= from_date]
        
        if to_date:
            filtered_logs = [log for log in filtered_logs if log.timestamp <= to_date]
        
        # Sort by timestamp descending and limit
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        return filtered_logs[:limit]
    
    def export_logs(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        format: str = "json"
    ) -> str:
        """Export audit logs for compliance reporting"""
        logs = self.get_logs(from_date=from_date, to_date=to_date, limit=10000)
        
        if format == "json":
            return json.dumps([log.to_dict() for log in logs], indent=2)
        
        # Add CSV format if needed
        return json.dumps([log.to_dict() for log in logs])

class PermissionGuard:
    """
    SECURITY: Role-based access control guard
    Enforces permissions and logs all access attempts
    """
    
    def __init__(self, audit_logger: AuditLogger):
        self.audit_logger = audit_logger
        self.permissions = self._initialize_permissions()
    
    def _initialize_permissions(self) -> Dict[str, List[str]]:
        """Initialize role-based permissions"""
        return {
            "super_admin": ["*"],  # Full access
            "regional_manager": [
                "read:outlets", "read:orders", "read:sales_reps", "read:analytics",
                "update:sales_reps", "create:routes", "approve:credit_limits"
            ],
            "sales_rep": [
                "read:outlets", "read:products", "create:orders", "create:visits",
                "read:own_performance", "check_in:outlets", "check_out:outlets"
            ],
            "driver": [
                "read:routes", "read:deliveries", "update:delivery_status",
                "create:proof_of_delivery"
            ],
            "finance_officer": [
                "read:invoices", "create:invoices", "read:payments", "create:payments",
                "read:financial_reports", "export:financial_data"
            ],
            "outlet_owner": [
                "read:own_orders", "create:own_orders", "read:own_invoices",
                "read:own_payments", "update:own_profile"
            ]
        }
    
    def has_permission(self, user_role: str, permission: str) -> bool:
        """Check if user role has specific permission"""
        if user_role not in self.permissions:
            return False
        
        role_permissions = self.permissions[user_role]
        
        # Super admin has all permissions
        if "*" in role_permissions:
            return True
        
        return permission in role_permissions
    
    def check_access(
        self,
        user_id: str,
        user_role: str,
        action: str,
        resource_type: ResourceType,
        resource_id: str,
        ip_address: Optional[str] = None
    ) -> bool:
        """
        SECURITY: Check and log access attempt
        Returns True if access is granted, False otherwise
        """
        permission = f"{action}:{resource_type.value}"
        has_access = self.has_permission(user_role, permission)
        
        # Log access attempt
        self.audit_logger.log(
            user_id=user_id,
            action=AuditAction.READ if action == "read" else AuditAction.UPDATE,
            resource_type=resource_type,
            resource_id=resource_id,
            details={
                "user_role": user_role,
                "permission_requested": permission,
                "access_granted": has_access
            },
            ip_address=ip_address,
            severity=SeverityLevel.WARNING if not has_access else SeverityLevel.INFO
        )
        
        return has_access

# Global audit logger instance
_audit_logger_instance: Optional[AuditLogger] = None

def get_audit_logger() -> AuditLogger:
    """Get global audit logger instance"""
    global _audit_logger_instance
    if _audit_logger_instance is None:
        _audit_logger_instance = AuditLogger()
    return _audit_logger_instance

def get_permission_guard() -> PermissionGuard:
    """Get permission guard with audit logger"""
    return PermissionGuard(get_audit_logger())
