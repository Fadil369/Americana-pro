from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
from datetime import datetime

router = APIRouter(prefix="/outlets", tags=["outlet-verification"])

class OutletRegistration(BaseModel):
    cr_number: str
    name_ar: str
    name_en: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    category: str = "retail"

class VerifiedOutlet(BaseModel):
    id: str
    cr_number: str
    name_ar: str
    name_en: str
    address: str
    latitude: float
    longitude: float
    district: str
    city: str
    region: str
    is_verified: bool
    verification_date: datetime
    status: str = "active"

SAUDI_API_BASE_URL = "http://localhost:8004"

async def verify_with_saudi_api(cr_number: str, outlet_name: str):
    """Verify outlet with Saudi government APIs"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SAUDI_API_BASE_URL}/verify-outlet",
                params={"cr_number": cr_number, "outlet_name": outlet_name},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError:
            return None

@router.post("/register", response_model=VerifiedOutlet)
async def register_outlet(outlet: OutletRegistration):
    """Register and verify new outlet"""
    
    # Verify with Saudi APIs
    verification_result = await verify_with_saudi_api(outlet.cr_number, outlet.name_en)
    
    if not verification_result or not verification_result.get("success"):
        raise HTTPException(
            status_code=400,
            detail="Unable to verify outlet with Saudi government records"
        )
    
    verification_data = verification_result["verification"]
    address_data = verification_data["address"]
    
    # Create verified outlet record
    verified_outlet = VerifiedOutlet(
        id=f"OUT_{outlet.cr_number}",
        cr_number=outlet.cr_number,
        name_ar=verification_data["name_ar"],
        name_en=outlet.name_en,
        address=address_data["address"],
        latitude=float(address_data["latitude"]),
        longitude=float(address_data["longitude"]),
        district=address_data["district"],
        city=address_data["city"],
        region=address_data["regionName"],
        is_verified=True,
        verification_date=datetime.now()
    )
    
    return verified_outlet

@router.get("/verify/{cr_number}")
async def verify_outlet_status(cr_number: str):
    """Check outlet verification status"""
    
    # Get national address data
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SAUDI_API_BASE_URL}/national-address/{cr_number}",
                timeout=30.0
            )
            response.raise_for_status()
            addresses = response.json()
            
            if not addresses:
                return {
                    "cr_number": cr_number,
                    "is_verified": False,
                    "status": "not_found",
                    "message_ar": "لم يتم العثور على السجل التجاري",
                    "message_en": "Commercial registration not found"
                }
            
            primary_address = addresses[0]
            
            return {
                "cr_number": cr_number,
                "is_verified": True,
                "status": "verified",
                "business_name": primary_address["title"],
                "address": primary_address["address"],
                "city": primary_address["city"],
                "region": primary_address["regionName"],
                "coordinates": {
                    "latitude": float(primary_address["latitude"]),
                    "longitude": float(primary_address["longitude"])
                },
                "message_ar": "تم التحقق من السجل التجاري بنجاح",
                "message_en": "Commercial registration verified successfully"
            }
            
        except httpx.HTTPError:
            return {
                "cr_number": cr_number,
                "is_verified": False,
                "status": "error",
                "message_ar": "خطأ في التحقق من السجل التجاري",
                "message_en": "Error verifying commercial registration"
            }

@router.get("/nearby")
async def get_nearby_outlets(lat: float, lng: float, radius: float = 5.0):
    """Get nearby verified outlets"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SAUDI_API_BASE_URL}/nearby-outlets",
                params={"lat": lat, "lng": lng, "radius_km": radius},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError:
            # Return mock data if service unavailable
            return {
                "center": {"latitude": lat, "longitude": lng},
                "radius_km": radius,
                "total_outlets": 0,
                "outlets": [],
                "message": "Service temporarily unavailable"
            }

@router.get("/map-data")
async def get_outlets_map_data():
    """Get all outlets for map visualization"""
    
    # Mock verified outlets data
    outlets = [
        {
            "id": "OUT_1234567890",
            "name_ar": "متجر الحلويات الذهبية",
            "name_en": "Golden Sweets Store",
            "latitude": 24.7136,
            "longitude": 46.6753,
            "address": "شارع الملك فهد، الرياض",
            "district": "المروج",
            "city": "الرياض",
            "status": "active",
            "last_order": "2024-01-08",
            "total_orders": 45,
            "credit_balance": 2500.00
        },
        {
            "id": "OUT_0987654321", 
            "name_ar": "حلويات الأمير",
            "name_en": "Prince Sweets",
            "latitude": 24.6877,
            "longitude": 46.7219,
            "address": "طريق الملك عبدالعزيز، الرياض",
            "district": "العليا",
            "city": "الرياض",
            "status": "active",
            "last_order": "2024-01-07",
            "total_orders": 32,
            "credit_balance": 1800.00
        }
    ]
    
    return {
        "total_outlets": len(outlets),
        "active_outlets": len([o for o in outlets if o["status"] == "active"]),
        "outlets": outlets,
        "map_center": {
            "latitude": 24.7136,
            "longitude": 46.6753
        }
    }
