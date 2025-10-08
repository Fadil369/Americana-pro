from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import redis
import json
from products import router as products_router

app = FastAPI(
    title="SSDP Distribution Service",
    description="Smart Sweet Distribution Platform - Distribution Management API",
    version="1.0.0"
)

# Include products router
app.include_router(products_router)

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

# Security
security = HTTPBearer()

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
async def get_orders(status: Optional[str] = None):
    """Get all orders, optionally filtered by status"""
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
async def create_order(order: Order):
    """Create a new order"""
    order.id = f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}"
    order.created_at = datetime.now()
    
    # Cache order in Redis
    redis_client.setex(
        f"order:{order.id}", 
        3600, 
        json.dumps(order.dict(), default=str)
    )
    
    return order

@app.get("/outlets", response_model=List[Outlet])
async def get_outlets():
    """Get all outlets"""
    outlets = [
        {
            "id": "OUT001",
            "name": "Sweet Corner Store",
            "name_ar": "متجر ركن الحلويات",
            "address": "King Fahd Road, Riyadh",
            "location": {"lat": 24.7136, "lng": 46.6753},
            "contact_person": "أحمد محمد",
            "phone": "+966501234567",
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
async def get_dashboard_analytics():
    """Get dashboard analytics data"""
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
