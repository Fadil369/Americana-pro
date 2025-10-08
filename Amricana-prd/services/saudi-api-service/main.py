from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import httpx
import uuid
import sys
import os

# SECURITY: Add audit logger package to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'packages', 'audit-logger', 'src'))

from audit_logger import get_audit_logger, AuditAction, ResourceType, SeverityLevel
from permission_guard import get_permission_guard

app = FastAPI(
    title="SSDP Saudi API Integration Service",
    description="Integration with Saudi government APIs for business verification",
    version="1.0.0"
)

# SECURITY: Initialize security components
security = HTTPBearer()
audit_logger = get_audit_logger()
permission_guard = get_permission_guard()

# API Configuration
WATHQ_BASE_URL = "https://api.wathq.sa"
API_KEY = "Gkry243IzGXLzG88mKsbmGN6oUiUsI1E"
API_PASSWORD = "XJA6NGmEQhnyA7xB"

class NationalAddress(BaseModel):
    title: str
    address: str
    address2: str
    latitude: str
    longitude: str
    buildingNumber: str
    street: str
    district: str
    city: str
    postCode: str
    regionName: str
    status: str

class OutletVerification(BaseModel):
    cr_number: str
    name_ar: str
    name_en: str
    address: NationalAddress
    is_verified: bool
    verification_date: str

async def make_wathq_request(endpoint: str, cr_number: str):
    """Make authenticated request to Wathq API"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "THIQAH-API-ApiMsgRef": str(uuid.uuid4()),
        "THIQAH-API-ClientMsgRef": f"SSDP-{uuid.uuid4()}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{WATHQ_BASE_URL}{endpoint}/{cr_number}",
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "SSDP Saudi API Integration Service", "version": "1.0.0"}

@app.get("/national-address/{cr_number}", response_model=List[NationalAddress])
async def get_national_address(
    cr_number: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """SECURITY: Get national address data with audit logging"""
    # Extract user info
    user_id = "current_user"
    user_role = "sales_rep"  # TODO: Extract from JWT
    
    # SECURITY: Check permission (sales reps can verify outlets)
    if not permission_guard.has_permission(user_role, "create:outlet"):
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/national-address", "required_permission": "create:outlet"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        # Validate CR number format
        if not cr_number.isdigit() or len(cr_number) != 10:
            raise HTTPException(
                status_code=400, 
                detail="Commercial registration number must be 10 digits"
            )
        
        # HIPAA: Log API access
        audit_logger.log(
            user_id=user_id,
            action=AuditAction.READ,
            resource_type=ResourceType.OUTLET,
            resource_id=f"CR-{cr_number}",
            details={"api": "wathq_national_address"}
        )
        
        data = await make_wathq_request("/spl/national/address/info", cr_number)
        
        addresses = []
        for item in data:
            addresses.append(NationalAddress(
                title=item.get("title", ""),
                address=item.get("address", ""),
                address2=item.get("address2", ""),
                latitude=item.get("latitude", "0"),
                longitude=item.get("longitude", "0"),
                buildingNumber=item.get("buildingNumber", ""),
                street=item.get("street", ""),
                district=item.get("district", ""),
                city=item.get("city", ""),
                postCode=item.get("postCode", ""),
                regionName=item.get("regionName", ""),
                status=item.get("status", "")
            ))
        
        return addresses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch address: {str(e)}")

@app.post("/verify-outlet")
async def verify_outlet(
    cr_number: str,
    outlet_name: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """SECURITY: Verify outlet with audit logging"""
    # Extract user info
    user_id = "current_user"
    user_role = "sales_rep"  # TODO: Extract from JWT
    
    # SECURITY: Check permission
    if not permission_guard.has_permission(user_role, "create:outlet"):
        audit_logger.log_security_event(
            user_id=user_id,
            event_type="unauthorized_access",
            details={"endpoint": "/verify-outlet", "required_permission": "create:outlet"},
            severity=SeverityLevel.WARNING
        )
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        # Get national address (calls the method with credentials)
        addresses = await get_national_address(cr_number, credentials)
        
        if not addresses:
            raise HTTPException(status_code=404, detail="No address found for this CR number")
        
        primary_address = next((addr for addr in addresses if addr.status == "Active"), addresses[0])
        
        # Create verification record
        verification = OutletVerification(
            cr_number=cr_number,
            name_ar=primary_address.title,
            name_en=outlet_name,
            address=primary_address,
            is_verified=True,
            verification_date=str(uuid.uuid4())  # Mock timestamp
        )
        
        # HIPAA: Log outlet verification
        audit_logger.log(
            user_id=user_id,
            action=AuditAction.CREATE,
            resource_type=ResourceType.OUTLET,
            resource_id=f"CR-{cr_number}",
            details={
                "outlet_name": outlet_name,
                "verified": True,
                "city": primary_address.city
            }
        )
        
        return {
            "success": True,
            "verification": verification,
            "message_ar": "تم التحقق من المنشأة بنجاح",
            "message_en": "Outlet verified successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/nearby-outlets")
async def get_nearby_outlets(lat: float, lng: float, radius_km: float = 5.0):
    """Get nearby verified outlets within radius"""
    # Mock data for demonstration
    mock_outlets = [
        {
            "cr_number": "1234567890",
            "name_ar": "متجر الحلويات الذهبية",
            "name_en": "Golden Sweets Store",
            "distance_km": 1.2,
            "address": "شارع الملك فهد، الرياض",
            "latitude": lat + 0.01,
            "longitude": lng + 0.01,
            "is_verified": True
        },
        {
            "cr_number": "0987654321",
            "name_ar": "حلويات الأمير",
            "name_en": "Prince Sweets",
            "distance_km": 3.5,
            "address": "طريق الملك عبدالعزيز، الرياض",
            "latitude": lat - 0.02,
            "longitude": lng + 0.02,
            "is_verified": True
        }
    ]
    
    # Filter by radius
    nearby = [outlet for outlet in mock_outlets if outlet["distance_km"] <= radius_km]
    
    return {
        "center": {"latitude": lat, "longitude": lng},
        "radius_km": radius_km,
        "total_outlets": len(nearby),
        "outlets": nearby
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
