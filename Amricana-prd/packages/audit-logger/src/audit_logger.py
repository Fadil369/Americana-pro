# BRAINSAIT: Audit logger implementation
# HIPAA: Comprehensive audit logging with 7-year retention
# SECURITY: Tracks all data access and modifications

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
import hashlib
import os


class AuditAction(str, Enum):
    """Audit action types"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    ACCESS_DENIED = "access_denied"
    EXPORT = "export"
    APPROVE = "approve"
    REJECT = "reject"


class ResourceType(str, Enum):
    """Resource types for audit logging"""
    USER = "user"
    OUTLET = "outlet"
    ORDER = "order"
    INVOICE = "invoice"
    PAYMENT = "payment"
    SALES_REP = "sales_rep"
    DRIVER = "driver"
    VEHICLE = "vehicle"
    PRODUCT = "product"
    ROUTE = "route"
    REPORT = "report"
    SYSTEM = "system"
    PHI = "phi"  # Protected Health Information (for BrainSAIT integration)
    FINANCIAL = "financial"


class SeverityLevel(str, Enum):
    """Log severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AuditLog:
    """
    HIPAA: Individual audit log entry
    Includes checksum for tamper detection
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
        self.timestamp = datetime.utcnow()
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
        """SECURITY: Generate checksum for audit log integrity"""
        data = f"{self.timestamp.isoformat()}{self.user_id}{self.action}{self.resource_type}{self.resource_id}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def verify_integrity(self) -> bool:
        """SECURITY: Verify audit log has not been tampered with"""
        expected_checksum = self._generate_checksum()
        return self.checksum == expected_checksum
    
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
    SECURITY: Main audit logging service
    Implements comprehensive audit trail with 7-year retention
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        self.logs: List[AuditLog] = []
        self.storage_path = storage_path or os.getenv("AUDIT_LOG_PATH", "/var/log/ssdp/audit")
        self.retention_years = 7  # HIPAA/PDPL requirement
    
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
        """
        SECURITY: Log an action with comprehensive details
        """
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
        self._persist_log(audit_log)
        
        return audit_log
    
    def log_data_access(
        self,
        user_id: str,
        resource_type: ResourceType,
        resource_id: str,
        fields_accessed: List[str],
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """HIPAA: Log data access with field-level tracking"""
        return self.log(
            user_id=user_id,
            action=AuditAction.READ,
            resource_type=resource_type,
            resource_id=resource_id,
            details={"fields_accessed": fields_accessed},
            ip_address=ip_address,
            severity=SeverityLevel.INFO
        )
    
    def log_modification(
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
            severity=SeverityLevel.INFO
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
            action=AuditAction.ACCESS_DENIED,
            resource_type=ResourceType.SYSTEM,
            resource_id="security_event",
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
        
        # Sort by timestamp descending
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return filtered_logs[:limit]
    
    def export_logs(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        format: str = "json"
    ) -> str:
        """HIPAA: Export audit logs for compliance reporting"""
        logs = self.get_logs(from_date=from_date, to_date=to_date, limit=10000)
        
        if format == "json":
            return json.dumps([log.to_dict() for log in logs], indent=2)
        elif format == "csv":
            # Simple CSV export
            csv_lines = ["id,timestamp,user_id,action,resource_type,resource_id,severity"]
            for log in logs:
                csv_lines.append(
                    f"{log.id},{log.timestamp.isoformat()},{log.user_id},"
                    f"{log.action.value},{log.resource_type.value},{log.resource_id},{log.severity.value}"
                )
            return "\n".join(csv_lines)
        
        return json.dumps([log.to_dict() for log in logs])
    
    def verify_log_integrity(self, log_id: str) -> bool:
        """SECURITY: Verify integrity of a specific log entry"""
        log = next((log for log in self.logs if log.id == log_id), None)
        if not log:
            return False
        return log.verify_integrity()
    
    def cleanup_old_logs(self):
        """HIPAA: Clean up logs older than retention period"""
        cutoff_date = datetime.utcnow() - timedelta(days=self.retention_years * 365)
        self.logs = [log for log in self.logs if log.timestamp >= cutoff_date]
    
    def _persist_log(self, audit_log: AuditLog):
        """
        SECURITY: Persist log to storage
        In production, this should write to a secure database or file system
        """
        # TODO: Implement actual persistence to database or secure file storage
        # For now, just keep in memory
        pass


# Global audit logger instance
_audit_logger_instance: Optional[AuditLogger] = None


def get_audit_logger() -> AuditLogger:
    """Get global audit logger instance"""
    global _audit_logger_instance
    if _audit_logger_instance is None:
        _audit_logger_instance = AuditLogger()
    return _audit_logger_instance
