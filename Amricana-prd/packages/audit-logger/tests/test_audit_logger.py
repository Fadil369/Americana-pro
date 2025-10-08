# BRAINSAIT: Audit logger tests
# SECURITY: Test suite for audit logging functionality

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import pytest
from datetime import datetime, timedelta
from audit_logger import (
    AuditLogger,
    AuditLog,
    AuditAction,
    ResourceType,
    SeverityLevel
)


class TestAuditLog:
    """Test AuditLog class"""
    
    def test_audit_log_creation(self):
        """Test that audit log is created with all fields"""
        log = AuditLog(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001",
            details={"field": "name"},
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
            severity=SeverityLevel.INFO
        )
        
        assert log.user_id == "user123"
        assert log.action == AuditAction.READ
        assert log.resource_type == ResourceType.OUTLET
        assert log.resource_id == "OUT001"
        assert log.ip_address == "192.168.1.1"
        assert log.severity == SeverityLevel.INFO
        assert log.id is not None
        assert log.checksum is not None
    
    def test_audit_log_integrity(self):
        """Test that audit log checksum verification works"""
        log = AuditLog(
            user_id="user123",
            action=AuditAction.CREATE,
            resource_type=ResourceType.ORDER,
            resource_id="ORD001"
        )
        
        # Should verify successfully
        assert log.verify_integrity() is True
        
        # Tamper with log
        log.resource_id = "ORD002"
        
        # Should fail verification
        assert log.verify_integrity() is False
    
    def test_audit_log_to_dict(self):
        """Test conversion to dictionary"""
        log = AuditLog(
            user_id="user123",
            action=AuditAction.UPDATE,
            resource_type=ResourceType.INVOICE,
            resource_id="INV001"
        )
        
        log_dict = log.to_dict()
        
        assert log_dict['user_id'] == "user123"
        assert log_dict['action'] == "update"
        assert log_dict['resource_type'] == "invoice"
        assert 'timestamp' in log_dict
        assert 'checksum' in log_dict


class TestAuditLogger:
    """Test AuditLogger class"""
    
    def test_logger_initialization(self):
        """Test that logger initializes correctly"""
        logger = AuditLogger()
        assert logger.logs == []
        assert logger.retention_years == 7
    
    def test_log_creation(self):
        """Test that logs are created and stored"""
        logger = AuditLogger()
        
        log = logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        assert len(logger.logs) == 1
        assert logger.logs[0] == log
    
    def test_log_data_access(self):
        """Test data access logging"""
        logger = AuditLogger()
        
        log = logger.log_data_access(
            user_id="user123",
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001",
            fields_accessed=["name", "address", "phone"]
        )
        
        assert log.action == AuditAction.READ
        assert "fields_accessed" in log.details
        assert len(log.details["fields_accessed"]) == 3
    
    def test_log_modification(self):
        """Test modification logging"""
        logger = AuditLogger()
        
        changes = {
            "status": {"old": "pending", "new": "completed"}
        }
        
        log = logger.log_modification(
            user_id="user123",
            action=AuditAction.UPDATE,
            resource_type=ResourceType.ORDER,
            resource_id="ORD001",
            changes=changes
        )
        
        assert log.action == AuditAction.UPDATE
        assert "changes" in log.details
    
    def test_log_security_event(self):
        """Test security event logging"""
        logger = AuditLogger()
        
        log = logger.log_security_event(
            user_id="user456",
            event_type="failed_login",
            details={"reason": "invalid_password"},
            severity=SeverityLevel.WARNING
        )
        
        assert log.action == AuditAction.ACCESS_DENIED
        assert log.severity == SeverityLevel.WARNING
        assert log.details["event_type"] == "failed_login"
    
    def test_get_logs_with_filters(self):
        """Test log retrieval with filters"""
        logger = AuditLogger()
        
        # Create multiple logs
        logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        logger.log(
            user_id="user456",
            action=AuditAction.CREATE,
            resource_type=ResourceType.ORDER,
            resource_id="ORD001"
        )
        
        logger.log(
            user_id="user123",
            action=AuditAction.UPDATE,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT002"
        )
        
        # Filter by user
        user_logs = logger.get_logs(user_id="user123")
        assert len(user_logs) == 2
        
        # Filter by resource type
        outlet_logs = logger.get_logs(resource_type=ResourceType.OUTLET)
        assert len(outlet_logs) == 2
        
        # Filter by action
        read_logs = logger.get_logs(action=AuditAction.READ)
        assert len(read_logs) == 1
    
    def test_get_logs_with_date_range(self):
        """Test log retrieval with date range"""
        logger = AuditLogger()
        
        # Create logs
        logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        # Get logs from today
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        logs = logger.get_logs(from_date=today)
        
        assert len(logs) == 1
    
    def test_export_logs_json(self):
        """Test log export in JSON format"""
        logger = AuditLogger()
        
        logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        export = logger.export_logs(format="json")
        
        assert isinstance(export, str)
        assert "user123" in export
        assert "OUT001" in export
    
    def test_export_logs_csv(self):
        """Test log export in CSV format"""
        logger = AuditLogger()
        
        logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        export = logger.export_logs(format="csv")
        
        assert isinstance(export, str)
        assert "user123" in export
        assert "OUT001" in export
        assert "," in export  # CSV should have commas
    
    def test_verify_log_integrity(self):
        """Test log integrity verification"""
        logger = AuditLogger()
        
        log = logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        # Should verify successfully
        assert logger.verify_log_integrity(log.id) is True
        
        # Invalid log ID should return False
        assert logger.verify_log_integrity("invalid-id") is False
    
    def test_cleanup_old_logs(self):
        """Test that old logs are cleaned up"""
        logger = AuditLogger()
        
        # Create a log
        log = logger.log(
            user_id="user123",
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        # Manually set timestamp to 8 years ago (beyond retention)
        log.timestamp = datetime.utcnow() - timedelta(days=8*365)
        
        # Clean up
        logger.cleanup_old_logs()
        
        # Log should be removed
        assert len(logger.logs) == 0


class TestAuditLoggerIntegration:
    """Integration tests for audit logger"""
    
    def test_full_audit_trail(self):
        """Test complete audit trail for a typical workflow"""
        logger = AuditLogger()
        
        # User logs in
        logger.log_security_event(
            user_id="user123",
            event_type="login",
            severity=SeverityLevel.INFO
        )
        
        # User reads outlet data
        logger.log_data_access(
            user_id="user123",
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001",
            fields_accessed=["name", "address"]
        )
        
        # User creates order
        logger.log_modification(
            user_id="user123",
            action=AuditAction.CREATE,
            resource_type=ResourceType.ORDER,
            resource_id="ORD001"
        )
        
        # User logs out
        logger.log_security_event(
            user_id="user123",
            event_type="logout",
            severity=SeverityLevel.INFO
        )
        
        # Verify all logs were created
        user_logs = logger.get_logs(user_id="user123")
        assert len(user_logs) == 4
        
        # Verify log sequence
        assert user_logs[3].details["event_type"] == "login"
        assert user_logs[2].resource_type == ResourceType.OUTLET
        assert user_logs[1].resource_type == ResourceType.ORDER
        assert user_logs[0].details["event_type"] == "logout"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
