# BRAINSAIT: Permission guard for RBAC enforcement
# SECURITY: Role-based access control with audit logging

from typing import Dict, List, Optional

try:
    from .audit_logger import (
        AuditLogger,
        AuditAction,
        ResourceType,
        SeverityLevel,
        get_audit_logger
    )
except ImportError:
    # For standalone imports
    from audit_logger import (
        AuditLogger,
        AuditAction,
        ResourceType,
        SeverityLevel,
        get_audit_logger
    )


class PermissionGuard:
    """
    SECURITY: Role-based access control guard
    Enforces permissions and logs all access attempts
    """
    
    def __init__(self, audit_logger: Optional[AuditLogger] = None):
        self.audit_logger = audit_logger or get_audit_logger()
        self.permissions = self._initialize_permissions()
    
    def _initialize_permissions(self) -> Dict[str, List[str]]:
        """
        BRAINSAIT: Initialize role-based permissions for SSDP platform
        Follows the RBAC structure defined in the architecture
        """
        return {
            # Super admin has all permissions
            "super_admin": ["*"],
            
            # Regional manager permissions
            "regional_manager": [
                "read:outlet",
                "read:order",
                "read:sales_rep",
                "read:driver",
                "read:vehicle",
                "read:report",
                "read:invoice",
                "create:sales_rep",
                "update:sales_rep",
                "create:route",
                "update:route",
                "approve:order",
                "read:financial"
            ],
            
            # Sales rep permissions
            "sales_rep": [
                "read:outlet",
                "read:product",
                "create:order",
                "read:order",
                "update:order",
                "read:route",
                "create:outlet",  # Can register new outlets
                "read:sales_rep"  # Can view own profile
            ],
            
            # Driver permissions
            "driver": [
                "read:route",
                "read:order",
                "update:order",  # Can update delivery status
                "read:vehicle",
                "read:outlet"  # Need to see delivery locations
            ],
            
            # Finance officer permissions
            "finance_officer": [
                "read:invoice",
                "create:invoice",
                "update:invoice",
                "read:payment",
                "create:payment",
                "read:order",
                "read:outlet",
                "read:financial",
                "export:financial",
                "read:report"
            ],
            
            # Outlet owner permissions (self-service)
            "outlet_owner": [
                "read:outlet",  # Own outlet only
                "read:order",   # Own orders only
                "create:order",
                "read:invoice", # Own invoices only
                "read:payment", # Own payments only
                "read:product"
            ]
        }
    
    def has_permission(self, user_role: str, permission: str) -> bool:
        """
        SECURITY: Check if user role has specific permission
        
        Args:
            user_role: User's role (e.g., "sales_rep", "super_admin")
            permission: Permission string in format "action:resource" (e.g., "read:outlet")
        
        Returns:
            True if user has permission, False otherwise
        """
        if user_role not in self.permissions:
            return False
        
        role_permissions = self.permissions[user_role]
        
        # Super admin has all permissions
        if "*" in role_permissions:
            return True
        
        # Check exact permission match
        if permission in role_permissions:
            return True
        
        # Check wildcard permissions (e.g., "read:*" allows all read operations)
        action, resource = permission.split(":", 1) if ":" in permission else (permission, "*")
        wildcard_permission = f"{action}:*"
        
        return wildcard_permission in role_permissions
    
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
        
        Args:
            user_id: User ID attempting access
            user_role: User's role
            action: Action being attempted (read, create, update, delete, etc.)
            resource_type: Type of resource being accessed
            resource_id: ID of specific resource
            ip_address: IP address of request (optional)
        
        Returns:
            True if access is granted, False otherwise
        """
        permission = f"{action}:{resource_type.value}"
        has_access = self.has_permission(user_role, permission)
        
        # Log access attempt
        audit_action = self._map_action_to_audit_action(action, has_access)
        
        self.audit_logger.log(
            user_id=user_id,
            action=audit_action,
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
    
    def _map_action_to_audit_action(self, action: str, access_granted: bool) -> AuditAction:
        """Map permission action to audit action"""
        if not access_granted:
            return AuditAction.ACCESS_DENIED
        
        action_map = {
            "create": AuditAction.CREATE,
            "read": AuditAction.READ,
            "update": AuditAction.UPDATE,
            "delete": AuditAction.DELETE,
            "approve": AuditAction.APPROVE,
            "reject": AuditAction.REJECT,
            "export": AuditAction.EXPORT
        }
        
        return action_map.get(action, AuditAction.READ)
    
    def check_resource_ownership(
        self,
        user_id: str,
        resource_owner_id: str,
        user_role: str
    ) -> bool:
        """
        SECURITY: Check if user owns resource or has admin privileges
        Used for outlet_owner role to restrict access to own resources only
        
        Args:
            user_id: User ID attempting access
            resource_owner_id: Owner ID of the resource
            user_role: User's role
        
        Returns:
            True if user owns resource or has admin access
        """
        # Super admins and regional managers can access all resources
        if user_role in ["super_admin", "regional_manager"]:
            return True
        
        # Outlet owners can only access their own resources
        if user_role == "outlet_owner":
            return user_id == resource_owner_id
        
        # Other roles have standard RBAC
        return True
    
    def get_user_permissions(self, user_role: str) -> List[str]:
        """
        Get all permissions for a user role
        
        Args:
            user_role: User's role
        
        Returns:
            List of permissions the user has
        """
        return self.permissions.get(user_role, [])


# Global permission guard instance
_permission_guard_instance: Optional[PermissionGuard] = None


def get_permission_guard() -> PermissionGuard:
    """Get global permission guard instance"""
    global _permission_guard_instance
    if _permission_guard_instance is None:
        _permission_guard_instance = PermissionGuard()
    return _permission_guard_instance
