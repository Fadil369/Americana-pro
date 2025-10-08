from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import redis
import json
import sys
import os

# SECURITY: Add audit logger package to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'packages', 'audit-logger', 'src'))

from audit_logger import get_audit_logger, AuditAction, ResourceType, SeverityLevel
from permission_guard import get_permission_guard
from encryption import get_encryption_service

from products import router as products_router
from outlet_verification import router as outlets_router

app = FastAPI(
    title="SSDP Distribution Service",
    description="Smart Sweet Distribution Platform - Distribution Management API",
    version="1.0.0"
)

# Include routers
app.include_router(products_router)
app.include_router(outlets_router)

# CORS middleware for web app integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection for caching
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# SECURITY: Initialize security components
security = HTTPBearer()
audit_logger = get_audit_logger()
permission_guard = get_permission_guard()

# Set encryption key (in production, use secure key management)
os.environ.setdefault('ENCRYPTION_MASTER_KEY', 'ssdp-distribution-master-key-change-in-production')

# Pydantic models
class Order(BaseModel):
    id: Optional[str] = None
    outlet_id: str
    sales_rep_id: str
    items: List[dict]
    total_amount: float
    status: str = "pending"
    created_at: Optional[datetime] = None

class Outlet(BaseModel):
    id: Optional[str] = None
    name: str
    name_ar: str
    address: str
    location: dict  # {"lat": float, "lng": float}
    contact_person: str
    phone: str
    credit_limit: float
    current_balance: float

class Vehicle(BaseModel):
    id: str
    driver_name: str
    driver_name_ar: str
    license_plate: str
    capacity: float
    current_location: dict
    status: str  # "active", "inactive", "maintenance"

# API Endpoints
@app.get("/")
async def root():
    return {"message": "SSDP Distribution Service API", "version": "1.0.0"}

@app.get("/orders", response_model=List[Order])
async def get_orders(
    status: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """SECURITY: Get all orders with audit logging and permission check"""
    # Extract user info (in production, decode JWT)
    user_id = "current_user"
    user_role = "super_admin"  # TODO: Extract from JWT
    
    # SECURITY: Check permission
    if not permission_guard.has_permission(user_role, "read:order"):
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/orders", "required_permission": "read:order"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # HIPAA: Log data access
    audit_logger.log_data_access(
        user_id=user_id,
        resource_type=ResourceType.ORDER,
        resource_id="all",
        fields_accessed=["id", "outlet_id", "sales_rep_id", "items", "total_amount", "status"]
    )
    
    # Mock data - replace with database query
    orders = [
        {
            "id": "ORD001",
            "outlet_id": "OUT001",
            "sales_rep_id": "REP001",
            "items": [
                {"product_id": "PRD001", "name": "بقلاوة", "quantity": 10, "price": 25.0},
                {"product_id": "PRD002", "name": "كنافة", "quantity": 5, "price": 35.0}
            ],
            "total_amount": 425.0,
            "status": "pending",
            "created_at": datetime.now()
        }
    ]
    
    if status:
        orders = [order for order in orders if order["status"] == status]
    
    return orders

@app.post("/orders", response_model=Order)
async def create_order(
    order: Order,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """SECURITY: Create a new order with audit logging"""
    # Extract user info (in production, decode JWT)
    user_id = "current_user"
    user_role = "sales_rep"  # TODO: Extract from JWT
    
    # SECURITY: Check permission
    if not permission_guard.has_permission(user_role, "create:order"):
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/orders", "required_permission": "create:order"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    order.id = f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}"
    order.created_at = datetime.now()
    
    # HIPAA: Log order creation
    audit_logger.log_modification(
        user_id=user_id,
        action=AuditAction.CREATE,
        resource_type=ResourceType.ORDER,
        resource_id=order.id,
        changes={"outlet_id": order.outlet_id, "total_amount": order.total_amount}
    )
    
    # Cache order in Redis
    redis_client.setex(
        f"order:{order.id}", 
        3600, 
        json.dumps(order.dict(), default=str)
    )
    
    return order

@app.get("/outlets", response_model=List[Outlet])
async def get_outlets(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """SECURITY: Get all outlets with audit logging and data encryption"""
    # Extract user info (in production, decode JWT)
    user_id = "current_user"
    user_role = "sales_rep"  # TODO: Extract from JWT
    
    # SECURITY: Check permission
    if not permission_guard.has_permission(user_role, "read:outlet"):
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/outlets", "required_permission": "read:outlet"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # HIPAA: Log data access
    audit_logger.log_data_access(
        user_id=user_id,
        resource_type=ResourceType.OUTLET,
        resource_id="all",
        fields_accessed=["id", "name", "address", "phone", "credit_limit"]
    )
    
    # Mock data - in production, fetch from database and decrypt sensitive fields
    outlets = [
        {
            "id": "OUT001",
            "name": "Sweet Corner Store",
            "name_ar": "متجر ركن الحلويات",
            "address": "King Fahd Road, Riyadh",
            "location": {"lat": 24.7136, "lng": 46.6753},
            "contact_person": "أحمد محمد",
            "phone": "+966501234567",  # In production, this should be encrypted in DB
            "credit_limit": 50000.0,
            "current_balance": 12500.0
        }
    ]
    return outlets

@app.get("/vehicles/live", response_model=List[Vehicle])
async def get_live_vehicles():
    """Get real-time vehicle locations and status"""
    vehicles = [
        {
            "id": "VEH001",
            "driver_name": "Mohammed Ali",
            "driver_name_ar": "محمد علي",
            "license_plate": "ABC-1234",
            "capacity": 1000.0,
            "current_location": {"lat": 24.7136, "lng": 46.6753},
            "status": "active"
        }
    ]
    return vehicles

@app.get("/analytics/dashboard")
async def get_dashboard_analytics(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get dashboard analytics data"""
    # Extract user info
    user_id = "current_user"
    user_role = "regional_manager"  # TODO: Extract from JWT
    
    # SECURITY: Check permission
    if not permission_guard.has_permission(user_role, "read:report"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Log analytics access
    audit_logger.log(
        user_id=user_id,
        action=AuditAction.READ,
        resource_type=ResourceType.REPORT,
        resource_id="dashboard_analytics",
        details={"report_type": "dashboard"}
    )
    
    return {
        "total_sales_today": 125430.0,
        "active_vehicles": 24,
        "active_customers": 1234,
        "completed_orders": 89,
        "pending_orders": 12,
        "sales_trend": [
            {"date": "2024-01-01", "amount": 45000},
            {"date": "2024-01-02", "amount": 52000},
            {"date": "2024-01-03", "amount": 48000}
        ]
    }

@app.get("/security/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    resource_type: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """SECURITY: Get audit logs for compliance (admin only)"""
    # Extract user info
    user_id = "current_user"
    user_role = "super_admin"  # TODO: Extract from JWT
    
    # SECURITY: Only admins can view audit logs
    if user_role not in ["super_admin", "regional_manager"]:
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/security/audit-logs"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get logs
    resource_type_enum = ResourceType(resource_type) if resource_type else None
    logs = audit_logger.get_logs(
        resource_type=resource_type_enum,
        limit=limit
    )
    
    return {
        "total": len(logs),
        "logs": [log.to_dict() for log in logs]
    }

@app.get("/security/permissions/{role}")
async def get_role_permissions(
    role: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """SECURITY: Get permissions for a specific role"""
    permissions = permission_guard.get_user_permissions(role)
    return {
        "role": role,
        "permissions": permissions
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
