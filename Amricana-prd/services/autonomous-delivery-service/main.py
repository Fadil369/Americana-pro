# BRAINSAIT: Autonomous Delivery Service for SSDP Platform
# AGENT: AI-powered autonomous vehicle and drone delivery planning
# NEURAL: Route optimization for autonomous fleets

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Tuple
from datetime import datetime, timedelta
import uuid
from enum import Enum
import math

app = FastAPI(
    title="SSDP Autonomous Delivery Service",
    description="Autonomous delivery planning for drones, AVs, and delivery robots",
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
class VehicleType(str, Enum):
    DRONE = "drone"
    AUTONOMOUS_VEHICLE = "autonomous_vehicle"
    DELIVERY_ROBOT = "delivery_robot"

class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    IN_TRANSIT = "in_transit"
    CHARGING = "charging"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class DeliveryStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class WeatherCondition(str, Enum):
    CLEAR = "clear"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    WINDY = "windy"
    EXTREME = "extreme"

# Pydantic Models
class AutonomousVehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_type: VehicleType
    vehicle_id: str
    name: str
    status: VehicleStatus
    current_location: Dict[str, float]  # {"lat": 0.0, "lng": 0.0}
    battery_level: float = Field(..., ge=0, le=100)
    max_payload_kg: float
    max_range_km: float
    speed_kmh: float
    last_maintenance: datetime = Field(default_factory=datetime.utcnow)
    total_deliveries: int = 0

class DeliveryMission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    order_id: str
    outlet_id: str
    pickup_location: Dict[str, float]
    delivery_location: Dict[str, float]
    payload_kg: float
    estimated_distance_km: float
    estimated_duration_minutes: int
    status: DeliveryStatus
    scheduled_time: datetime
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    route_waypoints: List[Dict[str, float]] = []

class FleetStatus(BaseModel):
    total_vehicles: int
    available: int
    in_transit: int
    charging: int
    maintenance: int
    offline: int
    active_deliveries: int
    completed_today: int

class RouteOptimizationRequest(BaseModel):
    vehicle_id: str
    deliveries: List[Dict]  # List of delivery locations
    start_location: Dict[str, float]
    optimize_for: str = "time"  # "time", "distance", "battery"

class SafetyCheck(BaseModel):
    vehicle_id: str
    weather_condition: WeatherCondition
    wind_speed_kmh: float
    visibility_km: float
    traffic_density: str  # "low", "medium", "high"
    airspace_clearance: bool = True  # For drones

class AutoPilotCommand(BaseModel):
    vehicle_id: str
    command: str  # "start", "pause", "resume", "return", "emergency_land"
    parameters: Dict = {}

# In-memory storage
autonomous_vehicles: Dict[str, AutonomousVehicle] = {}
delivery_missions: Dict[str, DeliveryMission] = {}
mission_logs: List[Dict] = []

# Helper functions
def calculate_distance(loc1: Dict[str, float], loc2: Dict[str, float]) -> float:
    """
    NEURAL: Calculate distance between two GPS coordinates
    Uses Haversine formula
    """
    lat1, lon1 = loc1["lat"], loc1["lng"]
    lat2, lon2 = loc2["lat"], loc2["lng"]
    
    # Earth radius in kilometers
    R = 6371.0
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

def estimate_battery_consumption(vehicle: AutonomousVehicle, distance_km: float, payload_kg: float) -> float:
    """
    AGENT: Estimate battery consumption for delivery
    Returns percentage of battery required
    """
    # Base consumption per km (simplified model)
    base_consumption_per_km = 1.5
    
    # Weight factor (more weight = more power)
    weight_factor = 1 + (payload_kg / vehicle.max_payload_kg) * 0.3
    
    # Vehicle type factor
    type_factors = {
        VehicleType.DRONE: 1.2,  # Drones consume more battery
        VehicleType.AUTONOMOUS_VEHICLE: 0.8,
        VehicleType.DELIVERY_ROBOT: 1.0
    }
    
    consumption = distance_km * base_consumption_per_km * weight_factor * type_factors[vehicle.vehicle_type]
    
    # Add safety margin
    return min(consumption * 1.2, 100)

def check_vehicle_suitability(vehicle: AutonomousVehicle, mission: DeliveryMission) -> Tuple[bool, List[str]]:
    """
    BRAINSAIT: Check if vehicle is suitable for mission
    Returns (is_suitable, list_of_issues)
    """
    issues = []
    
    # Check status
    if vehicle.status != VehicleStatus.AVAILABLE:
        issues.append(f"Vehicle status is {vehicle.status.value}")
    
    # Check payload capacity
    if mission.payload_kg > vehicle.max_payload_kg:
        issues.append(f"Payload exceeds capacity ({mission.payload_kg}kg > {vehicle.max_payload_kg}kg)")
    
    # Check range
    required_battery = estimate_battery_consumption(vehicle, mission.estimated_distance_km, mission.payload_kg)
    if required_battery > vehicle.battery_level:
        issues.append(f"Insufficient battery ({required_battery:.1f}% required, {vehicle.battery_level:.1f}% available)")
    
    # Check if distance is within max range
    if mission.estimated_distance_km > vehicle.max_range_km:
        issues.append(f"Distance exceeds max range ({mission.estimated_distance_km:.1f}km > {vehicle.max_range_km}km)")
    
    return (len(issues) == 0, issues)

def optimize_route(waypoints: List[Dict[str, float]], start_location: Dict[str, float]) -> List[Dict[str, float]]:
    """
    NEURAL: Optimize delivery route using nearest neighbor algorithm
    Simple implementation (use advanced algorithms in production)
    """
    if not waypoints:
        return []
    
    route = []
    current = start_location
    remaining = waypoints.copy()
    
    while remaining:
        # Find nearest waypoint
        nearest = min(remaining, key=lambda w: calculate_distance(current, w))
        route.append(nearest)
        remaining.remove(nearest)
        current = nearest
    
    return route

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "SSDP Autonomous Delivery Service API",
        "version": "1.0.0",
        "features": [
            "Drone delivery planning",
            "Autonomous vehicle routing",
            "Delivery robot coordination",
            "Real-time fleet management",
            "Safety and weather monitoring"
        ],
        "vehicle_types": [vt.value for vt in VehicleType],
        "total_vehicles": len(autonomous_vehicles)
    }

@app.post("/vehicles/register", response_model=AutonomousVehicle)
async def register_vehicle(
    vehicle: AutonomousVehicle,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Register a new autonomous vehicle"""
    if vehicle.vehicle_id in autonomous_vehicles:
        raise HTTPException(status_code=400, detail="Vehicle already registered")
    
    autonomous_vehicles[vehicle.vehicle_id] = vehicle
    
    return vehicle

@app.get("/vehicles", response_model=List[AutonomousVehicle])
async def get_vehicles(
    vehicle_type: Optional[VehicleType] = None,
    status: Optional[VehicleStatus] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all autonomous vehicles with filters"""
    vehicles = list(autonomous_vehicles.values())
    
    if vehicle_type:
        vehicles = [v for v in vehicles if v.vehicle_type == vehicle_type]
    if status:
        vehicles = [v for v in vehicles if v.status == status]
    
    return vehicles

@app.get("/vehicles/{vehicle_id}", response_model=AutonomousVehicle)
async def get_vehicle(
    vehicle_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get specific vehicle details"""
    if vehicle_id not in autonomous_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return autonomous_vehicles[vehicle_id]

@app.post("/missions/create", response_model=DeliveryMission)
async def create_delivery_mission(
    mission: DeliveryMission,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Create autonomous delivery mission
    AGENT: Assigns and optimizes delivery route
    """
    # Verify vehicle exists
    if mission.vehicle_id not in autonomous_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = autonomous_vehicles[mission.vehicle_id]
    
    # Check vehicle suitability
    is_suitable, issues = check_vehicle_suitability(vehicle, mission)
    if not is_suitable:
        raise HTTPException(status_code=400, detail=f"Vehicle not suitable: {', '.join(issues)}")
    
    # Calculate route
    mission.estimated_distance_km = calculate_distance(mission.pickup_location, mission.delivery_location)
    mission.estimated_duration_minutes = int((mission.estimated_distance_km / vehicle.speed_kmh) * 60)
    
    # Store mission
    delivery_missions[mission.id] = mission
    
    # Update vehicle status
    vehicle.status = VehicleStatus.IN_TRANSIT
    
    return mission

@app.get("/missions", response_model=List[DeliveryMission])
async def get_missions(
    vehicle_id: Optional[str] = None,
    status: Optional[DeliveryStatus] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all delivery missions with filters"""
    missions = list(delivery_missions.values())
    
    if vehicle_id:
        missions = [m for m in missions if m.vehicle_id == vehicle_id]
    if status:
        missions = [m for m in missions if m.status == status]
    
    return missions

@app.post("/missions/{mission_id}/start")
async def start_mission(
    mission_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    AGENT: Start autonomous delivery mission
    Vehicle begins autonomous navigation
    """
    if mission_id not in delivery_missions:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    mission = delivery_missions[mission_id]
    
    if mission.status != DeliveryStatus.SCHEDULED:
        raise HTTPException(status_code=400, detail="Mission not in scheduled state")
    
    mission.status = DeliveryStatus.IN_PROGRESS
    mission.start_time = datetime.utcnow()
    
    # Log mission start
    mission_logs.append({
        "mission_id": mission_id,
        "event": "mission_started",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return {
        "message": "Mission started",
        "mission_id": mission_id,
        "status": mission.status,
        "start_time": mission.start_time
    }

@app.post("/missions/{mission_id}/complete")
async def complete_mission(
    mission_id: str,
    completion_data: Dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Complete delivery mission
    Updates vehicle and mission status
    """
    if mission_id not in delivery_missions:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    mission = delivery_missions[mission_id]
    vehicle = autonomous_vehicles[mission.vehicle_id]
    
    mission.status = DeliveryStatus.COMPLETED
    mission.completion_time = datetime.utcnow()
    
    # Update vehicle
    vehicle.status = VehicleStatus.AVAILABLE
    vehicle.total_deliveries += 1
    vehicle.current_location = mission.delivery_location
    
    # Calculate battery consumption
    battery_used = estimate_battery_consumption(vehicle, mission.estimated_distance_km, mission.payload_kg)
    vehicle.battery_level = max(0, vehicle.battery_level - battery_used)
    
    # Check if vehicle needs charging
    if vehicle.battery_level < 20:
        vehicle.status = VehicleStatus.CHARGING
    
    # Log mission completion
    mission_logs.append({
        "mission_id": mission_id,
        "event": "mission_completed",
        "timestamp": datetime.utcnow().isoformat(),
        "completion_data": completion_data
    })
    
    return {
        "message": "Mission completed",
        "mission_id": mission_id,
        "vehicle_id": vehicle.vehicle_id,
        "vehicle_battery": vehicle.battery_level
    }

@app.post("/route/optimize")
async def optimize_delivery_route(
    request: RouteOptimizationRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    NEURAL: Optimize delivery route for multiple stops
    Uses AI-powered route optimization
    """
    if request.vehicle_id not in autonomous_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = autonomous_vehicles[request.vehicle_id]
    
    # Extract delivery locations
    waypoints = [d["location"] for d in request.deliveries]
    
    # Optimize route
    optimized_route = optimize_route(waypoints, request.start_location)
    
    # Calculate total distance and time
    total_distance = 0
    current_loc = request.start_location
    
    for waypoint in optimized_route:
        total_distance += calculate_distance(current_loc, waypoint)
        current_loc = waypoint
    
    total_time_minutes = int((total_distance / vehicle.speed_kmh) * 60)
    battery_required = estimate_battery_consumption(vehicle, total_distance, vehicle.max_payload_kg * 0.5)
    
    return {
        "vehicle_id": request.vehicle_id,
        "optimized_route": optimized_route,
        "total_distance_km": round(total_distance, 2),
        "estimated_time_minutes": total_time_minutes,
        "battery_required_percentage": round(battery_required, 1),
        "feasible": battery_required <= vehicle.battery_level
    }

@app.post("/safety/check")
async def perform_safety_check(
    check: SafetyCheck,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Perform pre-flight/pre-delivery safety check
    SECURITY: Ensures safe autonomous operation
    """
    if check.vehicle_id not in autonomous_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = autonomous_vehicles[check.vehicle_id]
    
    issues = []
    warnings = []
    
    # Weather check
    if check.weather_condition == WeatherCondition.EXTREME:
        issues.append("Extreme weather conditions - operation not permitted")
    elif check.weather_condition == WeatherCondition.RAINY and vehicle.vehicle_type == VehicleType.DRONE:
        warnings.append("Rain detected - drone operations may be affected")
    
    # Wind speed check (important for drones)
    if vehicle.vehicle_type == VehicleType.DRONE and check.wind_speed_kmh > 40:
        issues.append(f"Wind speed too high for drone operations ({check.wind_speed_kmh} km/h)")
    elif vehicle.vehicle_type == VehicleType.DRONE and check.wind_speed_kmh > 25:
        warnings.append(f"Moderate wind speed detected ({check.wind_speed_kmh} km/h)")
    
    # Visibility check
    if check.visibility_km < 1:
        issues.append(f"Poor visibility ({check.visibility_km} km)")
    elif check.visibility_km < 3:
        warnings.append(f"Reduced visibility ({check.visibility_km} km)")
    
    # Airspace clearance (for drones)
    if vehicle.vehicle_type == VehicleType.DRONE and not check.airspace_clearance:
        issues.append("Airspace clearance required")
    
    # Traffic density
    if check.traffic_density == "high" and vehicle.vehicle_type == VehicleType.AUTONOMOUS_VEHICLE:
        warnings.append("High traffic density - delays expected")
    
    # Battery check
    if vehicle.battery_level < 30:
        warnings.append(f"Low battery level ({vehicle.battery_level}%)")
    
    # Determine if safe to proceed
    safe_to_proceed = len(issues) == 0
    
    return {
        "vehicle_id": check.vehicle_id,
        "safe_to_proceed": safe_to_proceed,
        "risk_level": "high" if issues else ("medium" if warnings else "low"),
        "issues": issues,
        "warnings": warnings,
        "recommendation": "Proceed with caution" if safe_to_proceed and warnings else ("Proceed" if safe_to_proceed else "Do not proceed")
    }

@app.post("/autopilot/command")
async def send_autopilot_command(
    command: AutoPilotCommand,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    AGENT: Send command to autonomous vehicle
    Controls vehicle autopilot system
    """
    if command.vehicle_id not in autonomous_vehicles:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = autonomous_vehicles[command.vehicle_id]
    
    # Process command
    response = {
        "vehicle_id": command.vehicle_id,
        "command": command.command,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "executed"
    }
    
    if command.command == "start":
        vehicle.status = VehicleStatus.IN_TRANSIT
    elif command.command == "pause":
        response["message"] = "Vehicle autopilot paused"
    elif command.command == "resume":
        vehicle.status = VehicleStatus.IN_TRANSIT
    elif command.command == "return":
        vehicle.status = VehicleStatus.IN_TRANSIT
        response["message"] = "Vehicle returning to base"
    elif command.command == "emergency_land":
        if vehicle.vehicle_type == VehicleType.DRONE:
            vehicle.status = VehicleStatus.AVAILABLE
            response["message"] = "Emergency landing initiated"
        else:
            response["status"] = "not_applicable"
    
    return response

@app.get("/fleet/status")
async def get_fleet_status(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Get overall fleet status
    Real-time fleet management dashboard
    """
    vehicles = list(autonomous_vehicles.values())
    missions = list(delivery_missions.values())
    
    status_counts = {
        "available": len([v for v in vehicles if v.status == VehicleStatus.AVAILABLE]),
        "in_transit": len([v for v in vehicles if v.status == VehicleStatus.IN_TRANSIT]),
        "charging": len([v for v in vehicles if v.status == VehicleStatus.CHARGING]),
        "maintenance": len([v for v in vehicles if v.status == VehicleStatus.MAINTENANCE]),
        "offline": len([v for v in vehicles if v.status == VehicleStatus.OFFLINE])
    }
    
    active_deliveries = len([m for m in missions if m.status == DeliveryStatus.IN_PROGRESS])
    completed_today = len([m for m in missions if m.status == DeliveryStatus.COMPLETED and 
                          m.completion_time and m.completion_time.date() == datetime.utcnow().date()])
    
    return {
        "total_vehicles": len(vehicles),
        "status_distribution": status_counts,
        "active_deliveries": active_deliveries,
        "completed_today": completed_today,
        "fleet_efficiency": round(completed_today / len(vehicles) * 100, 1) if vehicles else 0
    }

@app.get("/analytics/performance")
async def get_performance_analytics(
    vehicle_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Get fleet performance analytics
    """
    missions = list(delivery_missions.values())
    
    if vehicle_id:
        missions = [m for m in missions if m.vehicle_id == vehicle_id]
    
    if not missions:
        return {"message": "No data available"}
    
    completed = [m for m in missions if m.status == DeliveryStatus.COMPLETED]
    
    if not completed:
        return {"message": "No completed missions"}
    
    total_distance = sum(m.estimated_distance_km for m in completed)
    avg_duration = sum(m.estimated_duration_minutes for m in completed) / len(completed)
    
    return {
        "total_missions": len(missions),
        "completed_missions": len(completed),
        "success_rate": round(len(completed) / len(missions) * 100, 1),
        "total_distance_km": round(total_distance, 2),
        "average_duration_minutes": round(avg_duration, 1)
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Autonomous Delivery Service",
        "timestamp": datetime.utcnow().isoformat(),
        "total_vehicles": len(autonomous_vehicles),
        "active_missions": len([m for m in delivery_missions.values() if m.status == DeliveryStatus.IN_PROGRESS])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)
