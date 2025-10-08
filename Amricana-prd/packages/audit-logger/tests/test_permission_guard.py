# BRAINSAIT: Permission guard tests
# SECURITY: Test suite for RBAC functionality

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import pytest
from permission_guard import PermissionGuard
from audit_logger import AuditLogger, ResourceType, AuditAction


class TestPermissionGuard:
    """Test PermissionGuard class"""
    
    def test_initialization(self):
        """Test that permission guard initializes correctly"""
        guard = PermissionGuard()
        assert guard.permissions is not None
        assert len(guard.permissions) == 6  # 6 roles defined
    
    def test_super_admin_has_all_permissions(self):
        """Test that super admin has all permissions"""
        guard = PermissionGuard()
        
        # Super admin should have access to everything
        assert guard.has_permission("super_admin", "read:outlet") is True
        assert guard.has_permission("super_admin", "delete:invoice") is True
        assert guard.has_permission("super_admin", "anything:anything") is True
    
    def test_regional_manager_permissions(self):
        """Test regional manager permissions"""
        guard = PermissionGuard()
        
        # Should have these permissions
        assert guard.has_permission("regional_manager", "read:outlet") is True
        assert guard.has_permission("regional_manager", "read:report") is True
        assert guard.has_permission("regional_manager", "create:sales_rep") is True
        assert guard.has_permission("regional_manager", "approve:order") is True
        
        # Should NOT have these permissions
        assert guard.has_permission("regional_manager", "delete:invoice") is False
        assert guard.has_permission("regional_manager", "delete:outlet") is False
    
    def test_sales_rep_permissions(self):
        """Test sales rep permissions"""
        guard = PermissionGuard()
        
        # Should have these permissions
        assert guard.has_permission("sales_rep", "read:outlet") is True
        assert guard.has_permission("sales_rep", "create:order") is True
        assert guard.has_permission("sales_rep", "read:product") is True
        assert guard.has_permission("sales_rep", "create:outlet") is True
        
        # Should NOT have these permissions
        assert guard.has_permission("sales_rep", "delete:order") is False
        assert guard.has_permission("sales_rep", "read:financial") is False
        assert guard.has_permission("sales_rep", "approve:order") is False
    
    def test_driver_permissions(self):
        """Test driver permissions"""
        guard = PermissionGuard()
        
        # Should have these permissions
        assert guard.has_permission("driver", "read:route") is True
        assert guard.has_permission("driver", "read:order") is True
        assert guard.has_permission("driver", "update:order") is True
        assert guard.has_permission("driver", "read:vehicle") is True
        
        # Should NOT have these permissions
        assert guard.has_permission("driver", "create:order") is False
        assert guard.has_permission("driver", "read:invoice") is False
        assert guard.has_permission("driver", "read:financial") is False
    
    def test_finance_officer_permissions(self):
        """Test finance officer permissions"""
        guard = PermissionGuard()
        
        # Should have these permissions
        assert guard.has_permission("finance_officer", "read:invoice") is True
        assert guard.has_permission("finance_officer", "create:invoice") is True
        assert guard.has_permission("finance_officer", "read:payment") is True
        assert guard.has_permission("finance_officer", "read:financial") is True
        assert guard.has_permission("finance_officer", "export:financial") is True
        
        # Should NOT have these permissions
        assert guard.has_permission("finance_officer", "delete:outlet") is False
        assert guard.has_permission("finance_officer", "create:sales_rep") is False
    
    def test_outlet_owner_permissions(self):
        """Test outlet owner permissions"""
        guard = PermissionGuard()
        
        # Should have these permissions
        assert guard.has_permission("outlet_owner", "read:outlet") is True
        assert guard.has_permission("outlet_owner", "read:order") is True
        assert guard.has_permission("outlet_owner", "create:order") is True
        assert guard.has_permission("outlet_owner", "read:product") is True
        
        # Should NOT have these permissions
        assert guard.has_permission("outlet_owner", "update:outlet") is False
        assert guard.has_permission("outlet_owner", "read:financial") is False
        assert guard.has_permission("outlet_owner", "read:sales_rep") is False
    
    def test_invalid_role(self):
        """Test that invalid role returns False"""
        guard = PermissionGuard()
        
        assert guard.has_permission("invalid_role", "read:outlet") is False
    
    def test_check_access_with_logging(self):
        """Test that check_access logs access attempts"""
        audit_logger = AuditLogger()
        guard = PermissionGuard(audit_logger)
        
        # Successful access
        has_access = guard.check_access(
            user_id="user123",
            user_role="sales_rep",
            action="read",
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        assert has_access is True
        assert len(audit_logger.logs) == 1
        
        # Failed access
        has_access = guard.check_access(
            user_id="user123",
            user_role="sales_rep",
            action="delete",
            resource_type=ResourceType.OUTLET,
            resource_id="OUT001"
        )
        
        assert has_access is False
        assert len(audit_logger.logs) == 2
        # Last log should be a warning
        assert audit_logger.logs[-1].severity.value == "warning"
    
    def test_check_resource_ownership(self):
        """Test resource ownership validation"""
        guard = PermissionGuard()
        
        # Super admin can access any resource
        assert guard.check_resource_ownership(
            user_id="admin1",
            resource_owner_id="user123",
            user_role="super_admin"
        ) is True
        
        # Regional manager can access any resource
        assert guard.check_resource_ownership(
            user_id="manager1",
            resource_owner_id="user123",
            user_role="regional_manager"
        ) is True
        
        # Outlet owner can only access own resources
        assert guard.check_resource_ownership(
            user_id="user123",
            resource_owner_id="user123",
            user_role="outlet_owner"
        ) is True
        
        assert guard.check_resource_ownership(
            user_id="user123",
            resource_owner_id="user456",
            user_role="outlet_owner"
        ) is False
        
        # Other roles have standard RBAC
        assert guard.check_resource_ownership(
            user_id="rep1",
            resource_owner_id="user123",
            user_role="sales_rep"
        ) is True
    
    def test_get_user_permissions(self):
        """Test getting all permissions for a role"""
        guard = PermissionGuard()
        
        # Get sales rep permissions
        permissions = guard.get_user_permissions("sales_rep")
        
        assert isinstance(permissions, list)
        assert len(permissions) > 0
        assert "read:outlet" in permissions
        assert "create:order" in permissions
        
        # Get super admin permissions
        admin_permissions = guard.get_user_permissions("super_admin")
        assert admin_permissions == ["*"]
        
        # Get permissions for invalid role
        invalid_permissions = guard.get_user_permissions("invalid_role")
        assert invalid_permissions == []


class TestPermissionGuardIntegration:
    """Integration tests for permission guard"""
    
    def test_complete_order_workflow(self):
        """Test permissions for complete order workflow"""
        guard = PermissionGuard()
        
        # Sales rep creates order
        assert guard.has_permission("sales_rep", "create:order") is True
        
        # Regional manager approves order
        assert guard.has_permission("regional_manager", "approve:order") is True
        
        # Finance officer creates invoice
        assert guard.has_permission("finance_officer", "create:invoice") is True
        
        # Driver updates delivery status
        assert guard.has_permission("driver", "update:order") is True
        
        # Outlet owner views order
        assert guard.has_permission("outlet_owner", "read:order") is True
    
    def test_permission_hierarchy(self):
        """Test that permission hierarchy is enforced"""
        guard = PermissionGuard()
        
        # Super admin has all permissions
        for role in ["sales_rep", "driver", "finance_officer", "outlet_owner"]:
            for permission in guard.get_user_permissions(role):
                if permission != "*":
                    assert guard.has_permission("super_admin", permission) is True
    
    def test_separation_of_duties(self):
        """Test that separation of duties is enforced"""
        guard = PermissionGuard()
        
        # Sales rep should not have financial permissions
        assert guard.has_permission("sales_rep", "read:financial") is False
        assert guard.has_permission("sales_rep", "export:financial") is False
        
        # Driver should not have order creation permissions
        assert guard.has_permission("driver", "create:order") is False
        
        # Outlet owner should not have management permissions
        assert guard.has_permission("outlet_owner", "create:sales_rep") is False
        assert guard.has_permission("outlet_owner", "approve:order") is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
