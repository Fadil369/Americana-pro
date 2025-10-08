# BRAINSAIT: Security middleware for FastAPI services
# SECURITY: Comprehensive request validation, audit logging, and RBAC enforcement

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Callable, Dict, Any
import time
from datetime import datetime

from .audit_logger import get_audit_logger, AuditAction, ResourceType, SeverityLevel
from .permission_guard import get_permission_guard


class SecurityMiddleware:
    """
    SECURITY: Security middleware for FastAPI applications
    Provides audit logging, rate limiting, and request validation
    """
    
    def __init__(self, app):
        self.app = app
        self.audit_logger = get_audit_logger()
        self.permission_guard = get_permission_guard()
        self.request_counts: Dict[str, list] = {}  # IP -> [timestamp, ...]
    
    async def __call__(self, scope, receive, send):
        """
        Middleware call handler
        Logs all requests and enforces rate limiting
        """
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        
        # Extract request info
        client_ip = self._get_client_ip(request)
        path = request.url.path
        method = request.method
        
        # Rate limiting check
        if self._is_rate_limited(client_ip):
            # Log rate limit violation
            self.audit_logger.log_security_event(
                user_id="anonymous",
                event_type="rate_limit_exceeded",
                details={
                    "ip_address": client_ip,
                    "path": path,
                    "method": method
                },
                severity=SeverityLevel.WARNING
            )
            
            # Return 429 Too Many Requests
            response = {
                "type": "http.response.start",
                "status": 429,
                "headers": [[b"content-type", b"application/json"]],
            }
            await send(response)
            
            body = {
                "type": "http.response.body",
                "body": b'{"detail":"Rate limit exceeded. Please try again later."}',
            }
            await send(body)
            return
        
        # Track request
        self._track_request(client_ip)
        
        # Continue with normal request processing
        await self.app(scope, receive, send)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        # Check X-Forwarded-For header first (for proxies)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Fall back to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _is_rate_limited(self, ip: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
        """
        SECURITY: Check if IP is rate limited
        
        Args:
            ip: Client IP address
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
        
        Returns:
            True if rate limited, False otherwise
        """
        current_time = time.time()
        
        if ip not in self.request_counts:
            return False
        
        # Remove old requests outside the window
        self.request_counts[ip] = [
            ts for ts in self.request_counts[ip]
            if current_time - ts < window_seconds
        ]
        
        # Check if over limit
        return len(self.request_counts[ip]) >= max_requests
    
    def _track_request(self, ip: str):
        """Track request timestamp for rate limiting"""
        if ip not in self.request_counts:
            self.request_counts[ip] = []
        
        self.request_counts[ip].append(time.time())


class SecureEndpoint:
    """
    SECURITY: Decorator for securing API endpoints
    Enforces authentication, authorization, and audit logging
    """
    
    def __init__(
        self,
        required_permission: Optional[str] = None,
        resource_type: ResourceType = ResourceType.SYSTEM,
        audit_action: AuditAction = AuditAction.READ
    ):
        """
        Args:
            required_permission: Required permission (e.g., "read:outlet")
            resource_type: Type of resource being accessed
            audit_action: Action type for audit log
        """
        self.required_permission = required_permission
        self.resource_type = resource_type
        self.audit_action = audit_action
        self.audit_logger = get_audit_logger()
        self.permission_guard = get_permission_guard()
    
    def __call__(self, func: Callable) -> Callable:
        """Decorator implementation"""
        async def wrapper(*args, **kwargs):
            # Extract request and credentials from kwargs
            request: Optional[Request] = kwargs.get('request')
            credentials: Optional[HTTPAuthorizationCredentials] = kwargs.get('credentials')
            
            if not request:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Request object not found"
                )
            
            # Extract user info (in production, decode JWT token)
            user_id = self._extract_user_id(credentials)
            user_role = self._extract_user_role(credentials)
            
            # Get client IP
            client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
            
            # Check permission if required
            if self.required_permission and user_role:
                has_permission = self.permission_guard.has_permission(user_role, self.required_permission)
                
                if not has_permission:
                    # Log unauthorized access attempt
                    self.audit_logger.log_security_event(
                        user_id=user_id,
                        event_type="unauthorized_access",
                        details={
                            "required_permission": self.required_permission,
                            "user_role": user_role,
                            "endpoint": str(request.url.path),
                            "method": request.method
                        },
                        severity=SeverityLevel.WARNING
                    )
                    
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions"
                    )
            
            # Log the access
            resource_id = kwargs.get('id') or kwargs.get('resource_id') or 'unknown'
            
            self.audit_logger.log(
                user_id=user_id,
                action=self.audit_action,
                resource_type=self.resource_type,
                resource_id=str(resource_id),
                details={
                    "endpoint": str(request.url.path),
                    "method": request.method,
                    "user_role": user_role
                },
                ip_address=client_ip
            )
            
            # Execute the endpoint function
            return await func(*args, **kwargs)
        
        return wrapper
    
    def _extract_user_id(self, credentials: Optional[HTTPAuthorizationCredentials]) -> str:
        """
        Extract user ID from credentials
        In production, decode JWT token to get user ID
        """
        if not credentials:
            return "anonymous"
        
        # TODO: Implement JWT token decoding
        # For now, return placeholder
        return "current_user"
    
    def _extract_user_role(self, credentials: Optional[HTTPAuthorizationCredentials]) -> str:
        """
        Extract user role from credentials
        In production, decode JWT token to get user role
        """
        if not credentials:
            return "anonymous"
        
        # TODO: Implement JWT token decoding
        # For now, return placeholder
        return "super_admin"


def get_current_user(credentials: HTTPAuthorizationCredentials) -> Dict[str, Any]:
    """
    SECURITY: Get current user from JWT token
    
    Args:
        credentials: HTTP Bearer token credentials
    
    Returns:
        User information dictionary
    
    Raises:
        HTTPException: If token is invalid
    """
    # TODO: Implement JWT token decoding and validation
    # For now, return mock user
    return {
        "id": "user123",
        "role": "super_admin",
        "email": "admin@ssdp.sa"
    }


def require_permission(permission: str):
    """
    SECURITY: Dependency for checking specific permission
    
    Usage:
        @app.get("/outlets", dependencies=[Depends(require_permission("read:outlet"))])
        async def get_outlets():
            ...
    
    Args:
        permission: Required permission (e.g., "read:outlet")
    
    Returns:
        Dependency function
    """
    def check_permission(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
        user = get_current_user(credentials)
        permission_guard = get_permission_guard()
        
        if not permission_guard.has_permission(user['role'], permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required permission: {permission}"
            )
        
        return user
    
    return check_permission
