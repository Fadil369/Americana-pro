# BRAINSAIT: IoT Integration Service for SSDP Platform
# MEDICAL: Temperature monitoring for product quality
# AGENT: Real-time IoT device management and monitoring

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uuid
from enum import Enum
import json

app = FastAPI(
    title="SSDP IoT Integration Service",
    description="IoT device integration for smart coolers, RFID tracking, and smart scales",
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
class DeviceType(str, Enum):
    SMART_COOLER = "smart_cooler"
    RFID_READER = "rfid_reader"
    SMART_SCALE = "smart_scale"
    TEMPERATURE_SENSOR = "temperature_sensor"
    HUMIDITY_SENSOR = "humidity_sensor"

class DeviceStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"

class AlertLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

# Pydantic Models
class IoTDevice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_type: DeviceType
    device_id: str
    outlet_id: str
    location: str
    status: DeviceStatus
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    firmware_version: str = "1.0.0"
    battery_level: Optional[float] = None

class TemperatureReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    outlet_id: str
    temperature_celsius: float
    humidity_percentage: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_within_range: bool
    alert_triggered: bool = False

class RFIDReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    outlet_id: str
    rfid_tag: str
    product_id: str
    product_name: str
    action: str  # "scanned_in", "scanned_out", "inventory_check"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WeightReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    outlet_id: str
    product_id: Optional[str] = None
    weight_kg: float
    expected_weight_kg: Optional[float] = None
    variance_percentage: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class IoTAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    outlet_id: str
    alert_level: AlertLevel
    alert_type: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = False

# In-memory storage (replace with database in production)
iot_devices: Dict[str, IoTDevice] = {}
temperature_readings: List[TemperatureReading] = []
rfid_readings: List[RFIDReading] = []
weight_readings: List[WeightReading] = []
iot_alerts: List[IoTAlert] = []

# Temperature thresholds for sweet products
TEMP_MIN = 15.0  # Celsius
TEMP_MAX = 25.0  # Celsius
HUMIDITY_MAX = 60.0  # Percentage

# WebSocket connections for real-time updates
active_connections: List[WebSocket] = []

# Helper functions
def check_temperature_alert(reading: TemperatureReading) -> Optional[IoTAlert]:
    """Check if temperature reading triggers an alert"""
    if reading.temperature_celsius < TEMP_MIN:
        return IoTAlert(
            device_id=reading.device_id,
            outlet_id=reading.outlet_id,
            alert_level=AlertLevel.WARNING,
            alert_type="temperature_low",
            message=f"Temperature too low: {reading.temperature_celsius}°C (min: {TEMP_MIN}°C)"
        )
    elif reading.temperature_celsius > TEMP_MAX:
        alert_level = AlertLevel.CRITICAL if reading.temperature_celsius > TEMP_MAX + 5 else AlertLevel.WARNING
        return IoTAlert(
            device_id=reading.device_id,
            outlet_id=reading.outlet_id,
            alert_level=alert_level,
            alert_type="temperature_high",
            message=f"Temperature too high: {reading.temperature_celsius}°C (max: {TEMP_MAX}°C)"
        )
    
    if reading.humidity_percentage and reading.humidity_percentage > HUMIDITY_MAX:
        return IoTAlert(
            device_id=reading.device_id,
            outlet_id=reading.outlet_id,
            alert_level=AlertLevel.WARNING,
            alert_type="humidity_high",
            message=f"Humidity too high: {reading.humidity_percentage}% (max: {HUMIDITY_MAX}%)"
        )
    
    return None

async def broadcast_update(message: dict):
    """Broadcast IoT updates to all connected WebSocket clients"""
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except:
            active_connections.remove(connection)

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "SSDP IoT Integration Service API",
        "version": "1.0.0",
        "features": [
            "Smart cooler monitoring",
            "RFID product tracking",
            "Smart scale integration",
            "Real-time temperature alerts",
            "Humidity monitoring"
        ],
        "device_types": [dt.value for dt in DeviceType],
        "total_devices": len(iot_devices)
    }

@app.post("/devices/register", response_model=IoTDevice)
async def register_device(
    device: IoTDevice,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Register a new IoT device"""
    if device.device_id in iot_devices:
        raise HTTPException(status_code=400, detail="Device already registered")
    
    iot_devices[device.device_id] = device
    
    await broadcast_update({
        "event": "device_registered",
        "device": device.dict()
    })
    
    return device

@app.get("/devices", response_model=List[IoTDevice])
async def get_devices(
    outlet_id: Optional[str] = None,
    device_type: Optional[DeviceType] = None,
    status: Optional[DeviceStatus] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all registered IoT devices with optional filters"""
    devices = list(iot_devices.values())
    
    if outlet_id:
        devices = [d for d in devices if d.outlet_id == outlet_id]
    if device_type:
        devices = [d for d in devices if d.device_type == device_type]
    if status:
        devices = [d for d in devices if d.status == status]
    
    return devices

@app.get("/devices/{device_id}", response_model=IoTDevice)
async def get_device(
    device_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get specific IoT device details"""
    if device_id not in iot_devices:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return iot_devices[device_id]

@app.post("/readings/temperature", response_model=TemperatureReading)
async def record_temperature(
    reading: TemperatureReading,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Record temperature reading from smart cooler
    Monitors product storage conditions
    """
    # Check if within acceptable range
    reading.is_within_range = (
        TEMP_MIN <= reading.temperature_celsius <= TEMP_MAX and
        (reading.humidity_percentage is None or reading.humidity_percentage <= HUMIDITY_MAX)
    )
    
    # Check for alerts
    alert = check_temperature_alert(reading)
    if alert:
        reading.alert_triggered = True
        iot_alerts.append(alert)
        
        await broadcast_update({
            "event": "temperature_alert",
            "reading": reading.dict(),
            "alert": alert.dict()
        })
    
    temperature_readings.append(reading)
    
    # Update device last_seen
    if reading.device_id in iot_devices:
        iot_devices[reading.device_id].last_seen = datetime.utcnow()
        iot_devices[reading.device_id].status = DeviceStatus.ONLINE
    
    return reading

@app.get("/readings/temperature")
async def get_temperature_readings(
    device_id: Optional[str] = None,
    outlet_id: Optional[str] = None,
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get temperature readings with filters"""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    readings = [r for r in temperature_readings if r.timestamp > cutoff_time]
    
    if device_id:
        readings = [r for r in readings if r.device_id == device_id]
    if outlet_id:
        readings = [r for r in readings if r.outlet_id == outlet_id]
    
    return {
        "total": len(readings),
        "readings": readings
    }

@app.post("/readings/rfid", response_model=RFIDReading)
async def record_rfid_scan(
    reading: RFIDReading,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Record RFID scan for product tracking
    Enables real-time inventory management
    """
    rfid_readings.append(reading)
    
    # Update device last_seen
    if reading.device_id in iot_devices:
        iot_devices[reading.device_id].last_seen = datetime.utcnow()
        iot_devices[reading.device_id].status = DeviceStatus.ONLINE
    
    await broadcast_update({
        "event": "rfid_scan",
        "reading": reading.dict()
    })
    
    return reading

@app.get("/readings/rfid")
async def get_rfid_readings(
    device_id: Optional[str] = None,
    outlet_id: Optional[str] = None,
    product_id: Optional[str] = None,
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get RFID scan history"""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    readings = [r for r in rfid_readings if r.timestamp > cutoff_time]
    
    if device_id:
        readings = [r for r in readings if r.device_id == device_id]
    if outlet_id:
        readings = [r for r in readings if r.outlet_id == outlet_id]
    if product_id:
        readings = [r for r in readings if r.product_id == product_id]
    
    return {
        "total": len(readings),
        "readings": readings
    }

@app.post("/readings/weight", response_model=WeightReading)
async def record_weight(
    reading: WeightReading,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Record weight measurement from smart scale
    Helps detect theft and inventory discrepancies
    """
    # Calculate variance if expected weight is provided
    if reading.expected_weight_kg:
        variance = ((reading.weight_kg - reading.expected_weight_kg) / reading.expected_weight_kg) * 100
        reading.variance_percentage = round(variance, 2)
        
        # Generate alert if variance is significant
        if abs(variance) > 10:  # More than 10% difference
            alert = IoTAlert(
                device_id=reading.device_id,
                outlet_id=reading.outlet_id,
                alert_level=AlertLevel.WARNING,
                alert_type="weight_variance",
                message=f"Weight variance detected: {reading.variance_percentage}% from expected"
            )
            iot_alerts.append(alert)
            
            await broadcast_update({
                "event": "weight_alert",
                "reading": reading.dict(),
                "alert": alert.dict()
            })
    
    weight_readings.append(reading)
    
    # Update device last_seen
    if reading.device_id in iot_devices:
        iot_devices[reading.device_id].last_seen = datetime.utcnow()
        iot_devices[reading.device_id].status = DeviceStatus.ONLINE
    
    return reading

@app.get("/readings/weight")
async def get_weight_readings(
    device_id: Optional[str] = None,
    outlet_id: Optional[str] = None,
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get weight readings with filters"""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    readings = [r for r in weight_readings if r.timestamp > cutoff_time]
    
    if device_id:
        readings = [r for r in readings if r.device_id == device_id]
    if outlet_id:
        readings = [r for r in readings if r.outlet_id == outlet_id]
    
    return {
        "total": len(readings),
        "readings": readings
    }

@app.get("/alerts", response_model=List[IoTAlert])
async def get_alerts(
    outlet_id: Optional[str] = None,
    alert_level: Optional[AlertLevel] = None,
    acknowledged: Optional[bool] = None,
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get IoT alerts with filters"""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    alerts = [a for a in iot_alerts if a.timestamp > cutoff_time]
    
    if outlet_id:
        alerts = [a for a in alerts if a.outlet_id == outlet_id]
    if alert_level:
        alerts = [a for a in alerts if a.alert_level == alert_level]
    if acknowledged is not None:
        alerts = [a for a in alerts if a.acknowledged == acknowledged]
    
    return alerts

@app.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Acknowledge an IoT alert"""
    for alert in iot_alerts:
        if alert.id == alert_id:
            alert.acknowledged = True
            return {"message": "Alert acknowledged", "alert_id": alert_id}
    
    raise HTTPException(status_code=404, detail="Alert not found")

@app.get("/analytics/device-status")
async def get_device_status_analytics(
    outlet_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Get device status analytics
    Provides insights for maintenance planning
    """
    devices = list(iot_devices.values())
    
    if outlet_id:
        devices = [d for d in devices if d.outlet_id == outlet_id]
    
    status_counts = {}
    for status in DeviceStatus:
        status_counts[status.value] = len([d for d in devices if d.status == status])
    
    # Check for devices that haven't reported in 1 hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    offline_devices = [d for d in devices if d.last_seen < one_hour_ago]
    
    for device in offline_devices:
        if device.status != DeviceStatus.OFFLINE:
            device.status = DeviceStatus.OFFLINE
    
    return {
        "total_devices": len(devices),
        "status_distribution": status_counts,
        "offline_devices": len(offline_devices),
        "health_score": round((len(devices) - len(offline_devices)) / len(devices) * 100, 2) if devices else 0
    }

@app.get("/analytics/temperature-trends")
async def get_temperature_trends(
    outlet_id: Optional[str] = None,
    hours: int = 24,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get temperature trend analytics"""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    readings = [r for r in temperature_readings if r.timestamp > cutoff_time]
    
    if outlet_id:
        readings = [r for r in readings if r.outlet_id == outlet_id]
    
    if not readings:
        return {"message": "No data available"}
    
    temps = [r.temperature_celsius for r in readings]
    avg_temp = sum(temps) / len(temps)
    min_temp = min(temps)
    max_temp = max(temps)
    
    violations = len([r for r in readings if not r.is_within_range])
    
    return {
        "total_readings": len(readings),
        "average_temperature": round(avg_temp, 2),
        "min_temperature": round(min_temp, 2),
        "max_temperature": round(max_temp, 2),
        "violations": violations,
        "compliance_rate": round((len(readings) - violations) / len(readings) * 100, 2)
    }

@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    """
    AGENT: WebSocket endpoint for real-time IoT updates
    Pushes live data to connected clients
    """
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await websocket.send_json({"status": "connected"})
    except WebSocketDisconnect:
        active_connections.remove(websocket)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "IoT Integration Service",
        "timestamp": datetime.utcnow().isoformat(),
        "active_devices": len(iot_devices),
        "active_connections": len(active_connections)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
