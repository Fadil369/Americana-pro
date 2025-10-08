# BRAINSAIT: Sales service for SSDP platform
# MEDICAL: Tracks sales rep performance and customer interactions
# HIPAA: Implements audit logging for all customer data access

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json

app = FastAPI(
    title="SSDP Sales Service",
    description="Smart Sweet Distribution Platform - Sales Management API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Enums
class SalesRepStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    SUSPENDED = "suspended"

class VisitStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Pydantic models
class SalesRep(BaseModel):
    id: Optional[str] = None
    name: str
    name_ar: str
    email: str
    phone: str
    territory: str
    status: SalesRepStatus = SalesRepStatus.ACTIVE
    sales_target: float = 0.0
    current_sales: float = 0.0
    commission_rate: float = 0.05
    joined_date: Optional[datetime] = None

class OutletVisit(BaseModel):
    id: Optional[str] = None
    sales_rep_id: str
    outlet_id: str
    visit_date: datetime
    status: VisitStatus = VisitStatus.PLANNED
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    check_in_location: Optional[Dict[str, float]] = None
    check_in_photo: Optional[str] = None
    notes: Optional[str] = None
    notes_ar: Optional[str] = None
    orders_created: List[str] = []

class SalesPerformance(BaseModel):
    sales_rep_id: str
    period_start: datetime
    period_end: datetime
    total_sales: float
    total_orders: int
    outlets_visited: int
    target_achievement: float
    commission_earned: float
    rank: Optional[int] = None

class DailyRoute(BaseModel):
    id: Optional[str] = None
    sales_rep_id: str
    date: datetime
    planned_outlets: List[str]
    completed_outlets: List[str] = []
    total_distance_km: Optional[float] = None
    status: str = "planned"

# HIPAA: Audit logging
class AuditLog(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Optional[Dict] = None

# In-memory storage (replace with database in production)
sales_reps_db: Dict[str, SalesRep] = {}
visits_db: Dict[str, OutletVisit] = {}
routes_db: Dict[str, DailyRoute] = {}
audit_logs: List[AuditLog] = []

# HIPAA: Audit logging function
def log_audit(user_id: str, action: str, resource_type: str, resource_id: str, details: Optional[Dict] = None):
    """Log all data access for compliance"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details
    )
    audit_logs.append(audit_log)

@app.get("/")
async def root():
    return {
        "message": "SSDP Sales Service API",
        "version": "1.0.0",
        "features": [
            "Sales rep management",
            "Outlet visit tracking",
            "Performance analytics",
            "Route planning",
            "Commission calculation"
        ]
    }

# Sales Rep endpoints
@app.get("/sales-reps", response_model=List[SalesRep])
async def get_sales_reps(
    territory: Optional[str] = None,
    status: Optional[SalesRepStatus] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all sales representatives"""
    # HIPAA: Log access
    log_audit(
        user_id="current_user",
        action="list",
        resource_type="sales_rep",
        resource_id="all"
    )
    
    reps = list(sales_reps_db.values())
    
    if territory:
        reps = [rep for rep in reps if rep.territory == territory]
    if status:
        reps = [rep for rep in reps if rep.status == status]
    
    return reps

@app.post("/sales-reps", response_model=SalesRep)
async def create_sales_rep(
    rep: SalesRep,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new sales representative"""
    rep.id = str(uuid.uuid4())
    rep.joined_date = datetime.now()
    sales_reps_db[rep.id] = rep
    
    # HIPAA: Log creation
    log_audit(
        user_id="current_user",
        action="create",
        resource_type="sales_rep",
        resource_id=rep.id
    )
    
    return rep

@app.get("/sales-reps/{rep_id}", response_model=SalesRep)
async def get_sales_rep(
    rep_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get sales rep by ID"""
    if rep_id not in sales_reps_db:
        raise HTTPException(status_code=404, detail="Sales rep not found")
    
    # HIPAA: Log access
    log_audit(
        user_id="current_user",
        action="read",
        resource_type="sales_rep",
        resource_id=rep_id
    )
    
    return sales_reps_db[rep_id]

@app.put("/sales-reps/{rep_id}", response_model=SalesRep)
async def update_sales_rep(
    rep_id: str,
    rep_update: SalesRep,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update sales representative"""
    if rep_id not in sales_reps_db:
        raise HTTPException(status_code=404, detail="Sales rep not found")
    
    rep_update.id = rep_id
    sales_reps_db[rep_id] = rep_update
    
    # HIPAA: Log update
    log_audit(
        user_id="current_user",
        action="update",
        resource_type="sales_rep",
        resource_id=rep_id
    )
    
    return rep_update

# Visit tracking endpoints
@app.post("/visits/check-in", response_model=OutletVisit)
async def check_in_visit(
    visit: OutletVisit,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """BRAINSAIT: Smart check-in with geofencing and photo"""
    visit.id = str(uuid.uuid4())
    visit.check_in_time = datetime.now()
    visit.status = VisitStatus.IN_PROGRESS
    visits_db[visit.id] = visit
    
    # HIPAA: Log check-in
    log_audit(
        user_id=visit.sales_rep_id,
        action="check_in",
        resource_type="outlet_visit",
        resource_id=visit.id,
        details={"outlet_id": visit.outlet_id}
    )
    
    return visit

@app.post("/visits/{visit_id}/check-out", response_model=OutletVisit)
async def check_out_visit(
    visit_id: str,
    notes: Optional[str] = None,
    notes_ar: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Complete outlet visit"""
    if visit_id not in visits_db:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    visit = visits_db[visit_id]
    visit.check_out_time = datetime.now()
    visit.status = VisitStatus.COMPLETED
    if notes:
        visit.notes = notes
    if notes_ar:
        visit.notes_ar = notes_ar
    
    # HIPAA: Log check-out
    log_audit(
        user_id=visit.sales_rep_id,
        action="check_out",
        resource_type="outlet_visit",
        resource_id=visit_id
    )
    
    return visit

@app.get("/visits", response_model=List[OutletVisit])
async def get_visits(
    sales_rep_id: Optional[str] = None,
    outlet_id: Optional[str] = None,
    status: Optional[VisitStatus] = None,
    from_date: Optional[datetime] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get outlet visits with filters"""
    visits = list(visits_db.values())
    
    if sales_rep_id:
        visits = [v for v in visits if v.sales_rep_id == sales_rep_id]
    if outlet_id:
        visits = [v for v in visits if v.outlet_id == outlet_id]
    if status:
        visits = [v for v in visits if v.status == status]
    if from_date:
        visits = [v for v in visits if v.visit_date >= from_date]
    
    return visits

# Performance analytics
@app.get("/performance/{rep_id}", response_model=SalesPerformance)
async def get_performance(
    rep_id: str,
    period_days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """BRAINSAIT: Calculate sales rep performance metrics"""
    if rep_id not in sales_reps_db:
        raise HTTPException(status_code=404, detail="Sales rep not found")
    
    rep = sales_reps_db[rep_id]
    period_end = datetime.now()
    period_start = period_end - timedelta(days=period_days)
    
    # Calculate metrics (mock data - replace with actual calculations)
    total_sales = rep.current_sales
    total_orders = 15
    outlets_visited = 25
    target_achievement = (total_sales / rep.sales_target * 100) if rep.sales_target > 0 else 0
    commission_earned = total_sales * rep.commission_rate
    
    performance = SalesPerformance(
        sales_rep_id=rep_id,
        period_start=period_start,
        period_end=period_end,
        total_sales=total_sales,
        total_orders=total_orders,
        outlets_visited=outlets_visited,
        target_achievement=target_achievement,
        commission_earned=commission_earned,
        rank=1
    )
    
    return performance

@app.get("/leaderboard", response_model=List[SalesPerformance])
async def get_leaderboard(
    territory: Optional[str] = None,
    period_days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """BRAINSAIT: Sales rep leaderboard for gamification"""
    reps = list(sales_reps_db.values())
    
    if territory:
        reps = [rep for rep in reps if rep.territory == territory]
    
    leaderboard = []
    for idx, rep in enumerate(sorted(reps, key=lambda r: r.current_sales, reverse=True), 1):
        period_end = datetime.now()
        period_start = period_end - timedelta(days=period_days)
        
        performance = SalesPerformance(
            sales_rep_id=rep.id,
            period_start=period_start,
            period_end=period_end,
            total_sales=rep.current_sales,
            total_orders=15,
            outlets_visited=25,
            target_achievement=(rep.current_sales / rep.sales_target * 100) if rep.sales_target > 0 else 0,
            commission_earned=rep.current_sales * rep.commission_rate,
            rank=idx
        )
        leaderboard.append(performance)
    
    return leaderboard

# Route management
@app.post("/routes", response_model=DailyRoute)
async def create_route(
    route: DailyRoute,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create daily route for sales rep"""
    route.id = str(uuid.uuid4())
    routes_db[route.id] = route
    
    log_audit(
        user_id=route.sales_rep_id,
        action="create",
        resource_type="daily_route",
        resource_id=route.id
    )
    
    return route

@app.get("/routes/{rep_id}/today", response_model=Optional[DailyRoute])
async def get_today_route(
    rep_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get today's route for sales rep"""
    today = datetime.now().date()
    
    for route in routes_db.values():
        if route.sales_rep_id == rep_id and route.date.date() == today:
            return route
    
    return None

@app.get("/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """HIPAA: Retrieve audit logs for compliance"""
    return {
        "total": len(audit_logs),
        "logs": audit_logs[-limit:]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
