# Phase 4 Integration Examples

This guide provides practical examples of how to integrate Phase 4 innovations into your SSDP applications.

## Table of Contents
1. [Computer Vision Integration](#computer-vision-integration)
2. [IoT Device Integration](#iot-device-integration)
3. [Blockchain Integration](#blockchain-integration)
4. [Autonomous Delivery Integration](#autonomous-delivery-integration)

---

## Computer Vision Integration

### Example 1: Shelf Compliance Check in Sales Rep App

```typescript
// Mobile App (React Native)
import * as ImagePicker from 'expo-image-picker';

const checkShelfCompliance = async (outletId: string) => {
  // Take photo of shelf
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('image', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'shelf.jpg',
    } as any);

    // Send to Computer Vision API
    const response = await fetch(
      `${API_BASE_URL}/analyze/shelf-compliance?outlet_id=${outletId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      }
    );

    const analysis = await response.json();
    
    // Display results
    Alert.alert(
      'Shelf Compliance',
      `Score: ${analysis.compliance_score}/100\n` +
      `Level: ${analysis.compliance_level}\n` +
      `Issues: ${analysis.issues_detected.join(', ')}`
    );

    // Show recommendations
    analysis.recommendations.forEach(rec => {
      console.log(`📋 ${rec}`);
    });
  }
};
```

### Example 2: Damage Detection During Delivery

```python
# Backend Integration (Python)
import httpx
import base64

async def check_product_damage(image_path: str, product_id: str) -> dict:
    """
    Check product for damage before delivery
    """
    async with httpx.AsyncClient() as client:
        with open(image_path, 'rb') as f:
            files = {'image': ('product.jpg', f, 'image/jpeg')}
            params = {'product_id': product_id}
            
            response = await client.post(
                'http://localhost:8004/analyze/damage-detection',
                params=params,
                files=files,
                headers={'Authorization': 'Bearer token'}
            )
            
            result = response.json()
            
            if result['damage_level'] != 'none':
                # Alert warehouse manager
                await send_alert(
                    f"Product {product_id} has {result['damage_level']} damage",
                    recommendations=result['recommendations']
                )
            
            return result
```

### Example 3: Counterfeit Check Integration

```javascript
// Web Dashboard (Next.js)
const verifyProductAuthenticity = async (imageFile, productId) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('product_id', productId);

  try {
    const response = await fetch('/api/cv/counterfeit-check', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!result.is_authentic) {
      // Show warning
      toast.error(`⚠️ COUNTERFEIT DETECTED!\n${result.recommendation}`);
      
      // Log to security system
      await logSecurityIncident({
        type: 'counterfeit_detected',
        productId,
        anomalies: result.anomalies_detected,
        confidence: result.confidence_score
      });
    } else {
      toast.success('✅ Product Verified Authentic');
    }

    return result;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};
```

---

## IoT Device Integration

### Example 1: Smart Cooler Temperature Monitoring

```python
# IoT Device Script (Raspberry Pi)
import requests
import time
from datetime import datetime
import Adafruit_DHT  # Temperature/Humidity sensor library

SENSOR_PIN = 4
DEVICE_ID = "COOLER_001"
OUTLET_ID = "OUT_123"
API_URL = "http://ssdp-api:8005"

def read_sensor():
    """Read temperature and humidity from DHT22 sensor"""
    humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, SENSOR_PIN)
    return temperature, humidity

def send_reading(temperature, humidity):
    """Send reading to IoT service"""
    payload = {
        "device_id": DEVICE_ID,
        "outlet_id": OUTLET_ID,
        "temperature_celsius": temperature,
        "humidity_percentage": humidity,
        "is_within_range": True  # Will be recalculated by server
    }
    
    try:
        response = requests.post(
            f"{API_URL}/readings/temperature",
            json=payload,
            headers={"Authorization": "Bearer device-token"},
            timeout=10
        )
        
        result = response.json()
        
        if result.get('alert_triggered'):
            print(f"⚠️ ALERT: Temperature out of range!")
            # Activate local alarm
            activate_alarm()
        
        return result
    except Exception as e:
        print(f"Failed to send reading: {e}")

def main():
    """Main monitoring loop"""
    print(f"Starting temperature monitoring for {DEVICE_ID}")
    
    while True:
        temp, humidity = read_sensor()
        
        if temp is not None and humidity is not None:
            print(f"📊 Temp: {temp:.1f}°C, Humidity: {humidity:.1f}%")
            send_reading(temp, humidity)
        else:
            print("❌ Failed to read sensor")
        
        time.sleep(300)  # Send reading every 5 minutes

if __name__ == '__main__':
    main()
```

### Example 2: RFID Inventory Tracking

```javascript
// RFID Reader Integration (Node.js)
const axios = require('axios');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const DEVICE_ID = 'RFID_READER_001';
const OUTLET_ID = 'OUT_123';
const API_URL = 'http://localhost:8005';

// Connect to RFID reader
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// Product database (simplified)
const PRODUCT_DB = {
  'RFID_001': { id: 'PROD_001', name: 'Kunafa Box 1kg' },
  'RFID_002': { id: 'PROD_002', name: 'Baklava Assorted 500g' },
  'RFID_003': { id: 'PROD_003', name: 'Maamoul Date Filled 1kg' }
};

parser.on('data', async (rfidTag) => {
  console.log(`📡 RFID Detected: ${rfidTag}`);
  
  const product = PRODUCT_DB[rfidTag];
  
  if (product) {
    try {
      const response = await axios.post(
        `${API_URL}/readings/rfid`,
        {
          device_id: DEVICE_ID,
          outlet_id: OUTLET_ID,
          rfid_tag: rfidTag,
          product_id: product.id,
          product_name: product.name,
          action: 'scanned_in'
        },
        {
          headers: { 'Authorization': 'Bearer device-token' }
        }
      );
      
      console.log(`✅ Logged: ${product.name}`);
    } catch (error) {
      console.error('Failed to log RFID scan:', error.message);
    }
  } else {
    console.warn(`⚠️ Unknown RFID tag: ${rfidTag}`);
  }
});

console.log('RFID Reader active...');
```

### Example 3: Real-Time WebSocket Updates

```typescript
// React Dashboard Component
import { useEffect, useState } from 'react';

const IoTDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:8005/ws/realtime');

    ws.onopen = () => {
      console.log('✅ Connected to IoT real-time stream');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'temperature_alert') {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'temperature',
          message: data.alert.message,
          level: data.alert.alert_level,
          timestamp: new Date()
        }]);

        // Show notification
        showNotification({
          title: 'Temperature Alert',
          body: data.alert.message,
          icon: '🌡️'
        });
      }

      if (data.event === 'device_registered') {
        setDevices(prev => [...prev, data.device]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from IoT stream');
      // Attempt reconnection
      setTimeout(() => window.location.reload(), 5000);
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>IoT Device Status</h2>
      {devices.map(device => (
        <DeviceCard key={device.id} device={device} />
      ))}

      <h2>Recent Alerts</h2>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};
```

---

## Blockchain Integration

### Example 1: Create Delivery Record

```python
# Driver App Backend
from datetime import datetime
import httpx

async def complete_delivery_with_blockchain(
    order_id: str,
    outlet_id: str,
    driver_id: str,
    products: list,
    gps_route: list,
    proof_of_delivery: dict
):
    """
    Complete delivery and store immutable record on blockchain
    """
    async with httpx.AsyncClient() as client:
        # Create delivery record
        payload = {
            "order_id": order_id,
            "outlet_id": outlet_id,
            "driver_id": driver_id,
            "products": products,
            "pickup_timestamp": datetime.utcnow().isoformat(),
            "delivery_timestamp": datetime.utcnow().isoformat(),
            "gps_route": gps_route,
            "proof_of_delivery": proof_of_delivery
        }
        
        response = await client.post(
            'http://localhost:8006/delivery/record',
            json=payload,
            headers={'Authorization': 'Bearer token'}
        )
        
        result = response.json()
        
        print(f"✅ Delivery recorded on blockchain")
        print(f"📦 Record ID: {result['record_id']}")
        print(f"🔗 Block Hash: {result['block_hash']}")
        
        return result
```

### Example 2: Smart Contract for Payment Terms

```javascript
// Finance Service Integration
const createPaymentContract = async (orderId, supplierId, terms) => {
  const contract = {
    contract_type: 'payment_terms',
    parties: [supplierId, 'SSDP_PLATFORM'],
    terms: {
      payment_amount: terms.amount,
      payment_due_date: terms.dueDate,
      early_payment_discount: terms.discount,
      late_payment_penalty: terms.penalty
    },
    status: 'active',
    auto_execute: true,
    execution_conditions: {
      delivery_confirmed: true,
      invoice_generated: true
    }
  };

  const response = await fetch('http://localhost:8006/contract/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(contract)
  });

  const result = await response.json();
  
  console.log(`📝 Smart contract created: ${result.id}`);
  
  return result;
};

// Auto-execute when conditions are met
const checkAndExecuteContract = async (contractId, deliveryData) => {
  if (deliveryData.status === 'completed' && deliveryData.invoice_id) {
    const executionData = {
      delivery_confirmed: true,
      invoice_generated: true,
      delivery_timestamp: deliveryData.timestamp
    };

    const response = await fetch(
      `http://localhost:8006/contract/${contractId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(executionData)
      }
    );

    const result = await response.json();
    
    console.log(`✅ Contract executed automatically`);
    // Trigger payment processing
    await processPayment(result);
  }
};
```

### Example 3: Halal Certification Verification

```typescript
// Mobile App - Scan Product QR Code
import { Camera } from 'expo-camera';

const HalalVerificationScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);

  const handleBarCodeScanned = async ({ data }) => {
    // Extract product ID from QR code
    const productId = extractProductId(data);

    try {
      const response = await fetch(
        `http://api.ssdp.sa/halal/verify/${productId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = await response.json();

      if (result.verified) {
        Alert.alert(
          '✅ Halal Certified',
          `Product: ${result.certification.product_name}\n` +
          `Certificate: ${result.certification.certificate_number}\n` +
          `Body: ${result.certification.certification_body}\n` +
          `Expires: ${result.certification.expiry_date}\n\n` +
          `✓ Verified on Blockchain`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Not Certified',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify halal certification');
    }
  };

  return (
    <Camera
      onBarCodeScanned={handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
    />
  );
};
```

---

## Autonomous Delivery Integration

### Example 1: Schedule Drone Delivery

```python
# Order Service Integration
import httpx
from datetime import datetime, timedelta

async def schedule_drone_delivery(order: dict):
    """
    Automatically assign order to drone if eligible
    """
    # Check if order qualifies for drone delivery
    if (
        order['weight_kg'] <= 10 and
        order['distance_km'] <= 15 and
        order['urgency'] == 'high'
    ):
        async with httpx.AsyncClient() as client:
            # Find available drone
            response = await client.get(
                'http://localhost:8007/vehicles',
                params={
                    'vehicle_type': 'drone',
                    'status': 'available'
                },
                headers={'Authorization': 'Bearer token'}
            )
            
            available_drones = response.json()
            
            if available_drones:
                drone = available_drones[0]
                
                # Create mission
                mission_payload = {
                    "vehicle_id": drone['vehicle_id'],
                    "order_id": order['id'],
                    "outlet_id": order['outlet_id'],
                    "pickup_location": order['warehouse_location'],
                    "delivery_location": order['outlet_location'],
                    "payload_kg": order['weight_kg'],
                    "status": "scheduled",
                    "scheduled_time": (datetime.utcnow() + timedelta(minutes=30)).isoformat()
                }
                
                mission_response = await client.post(
                    'http://localhost:8007/missions/create',
                    json=mission_payload,
                    headers={'Authorization': 'Bearer token'}
                )
                
                mission = mission_response.json()
                
                print(f"🚁 Drone delivery scheduled!")
                print(f"   Drone: {drone['name']}")
                print(f"   ETA: {mission['estimated_duration_minutes']} minutes")
                
                # Notify customer
                await notify_customer(
                    order['customer_id'],
                    f"Your order will arrive by drone in ~{mission['estimated_duration_minutes']} minutes!"
                )
                
                return mission
            else:
                print("No drones available, using traditional delivery")
                return None
    else:
        return None
```

### Example 2: Fleet Management Dashboard

```typescript
// React Dashboard
const AutonomousFleetDashboard = () => {
  const [fleetStatus, setFleetStatus] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        // Get fleet status
        const statusResponse = await fetch(
          'http://localhost:8007/fleet/status',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setFleetStatus(await statusResponse.json());

        // Get all vehicles
        const vehiclesResponse = await fetch(
          'http://localhost:8007/vehicles',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setVehicles(await vehiclesResponse.json());

        // Get active missions
        const missionsResponse = await fetch(
          'http://localhost:8007/missions?status=in_progress',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setActiveMissions(await missionsResponse.json());
      } catch (error) {
        console.error('Failed to fetch fleet data:', error);
      }
    };

    fetchFleetData();
    const interval = setInterval(fetchFleetData, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fleet-dashboard">
      <h1>🚁 Autonomous Fleet Management</h1>
      
      {fleetStatus && (
        <div className="fleet-stats">
          <StatCard
            title="Total Vehicles"
            value={fleetStatus.total_vehicles}
            icon="🚚"
          />
          <StatCard
            title="Available"
            value={fleetStatus.status_distribution.available}
            icon="✅"
          />
          <StatCard
            title="In Transit"
            value={fleetStatus.status_distribution.in_transit}
            icon="📦"
          />
          <StatCard
            title="Completed Today"
            value={fleetStatus.completed_today}
            icon="🎯"
          />
        </div>
      )}

      <div className="active-missions">
        <h2>Active Deliveries</h2>
        {activeMissions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onTrack={() => trackMission(mission.id)}
          />
        ))}
      </div>

      <div className="vehicle-grid">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onControl={() => openControlPanel(vehicle)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Example 3: Safety Check Before Launch

```javascript
// Pre-flight Safety Check
const performPreFlightCheck = async (vehicleId, missionData) => {
  // Get current weather
  const weather = await fetchWeatherData(missionData.delivery_location);
  
  const safetyCheck = {
    vehicle_id: vehicleId,
    weather_condition: weather.condition,
    wind_speed_kmh: weather.windSpeed,
    visibility_km: weather.visibility,
    traffic_density: await getTrafficDensity(missionData.route),
    airspace_clearance: await checkAirspace(missionData.delivery_location)
  };

  const response = await fetch('http://localhost:8007/safety/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(safetyCheck)
  });

  const result = await response.json();

  if (result.safe_to_proceed) {
    console.log('✅ Safety check passed');
    
    if (result.warnings.length > 0) {
      console.warn('⚠️ Warnings:', result.warnings);
    }
    
    // Start mission
    await startMission(missionData.mission_id);
  } else {
    console.error('❌ Safety check failed');
    console.error('Issues:', result.issues);
    
    // Reschedule or use alternative delivery method
    await handleUnsafeConditions(missionData, result);
  }

  return result;
};
```

---

## Complete End-to-End Example

Here's a complete workflow integrating all Phase 4 services:

```python
# Complete Smart Delivery Workflow
async def execute_smart_delivery_workflow(order_id: str):
    """
    End-to-end delivery with Phase 4 innovations
    """
    # Step 1: Computer Vision - Check product quality before dispatch
    print("📸 Step 1: Quality Check")
    product_image = capture_product_image(order_id)
    damage_check = await check_product_damage(product_image, order_id)
    
    if damage_check['damage_level'] != 'none':
        print(f"⚠️ Damage detected: {damage_check['damage_level']}")
        await handle_damaged_product(order_id)
        return
    
    # Step 2: IoT - Monitor during loading
    print("🌡️ Step 2: Temperature Monitoring")
    cooler_id = await assign_smart_cooler(order_id)
    await start_temperature_monitoring(cooler_id)
    
    # Step 3: Blockchain - Create delivery record
    print("⛓️ Step 3: Blockchain Record")
    delivery_record = await create_blockchain_delivery_record({
        'order_id': order_id,
        'temperature_monitoring': True,
        'quality_verified': True
    })
    
    # Step 4: Autonomous - Schedule delivery
    print("🚁 Step 4: Schedule Autonomous Delivery")
    mission = await schedule_autonomous_delivery(order_id)
    
    if mission:
        # Step 5: Real-time monitoring
        print("📡 Step 5: Real-time Tracking")
        await monitor_delivery_progress(mission['id'])
        
        # Step 6: Complete delivery
        print("✅ Step 6: Delivery Completion")
        await complete_delivery_with_proof(mission['id'])
        
        # Step 7: Update blockchain with completion
        await update_blockchain_record(delivery_record['id'], {
            'completed': True,
            'delivery_time': datetime.utcnow().isoformat(),
            'temperature_log': await get_temperature_log(cooler_id),
            'autonomous_vehicle': mission['vehicle_id']
        })
        
        print("🎉 Smart delivery completed successfully!")
    else:
        print("📦 Fallback to traditional delivery")
        await schedule_traditional_delivery(order_id)
```

---

## Best Practices

### 1. Error Handling
Always implement retry logic and fallback mechanisms:

```python
async def call_phase4_service_with_retry(service_url, payload, max_retries=3):
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(service_url, json=payload, timeout=10)
                return response.json()
        except Exception as e:
            if attempt == max_retries - 1:
                # Use fallback or manual process
                await handle_service_unavailable(service_url, payload)
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

### 2. Caching
Cache frequently accessed data:

```javascript
const cache = new Map();

const getWithCache = async (key, fetcher, ttl = 300000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

### 3. Security
Always validate and sanitize inputs:

```python
from pydantic import BaseModel, validator

class SafeImageUpload(BaseModel):
    outlet_id: str
    
    @validator('outlet_id')
    def validate_outlet_id(cls, v):
        if not v.startswith('OUT_'):
            raise ValueError('Invalid outlet ID format')
        return v
```

---

## Support

For integration support:
- **Documentation**: [PHASE4_INNOVATIONS.md](./PHASE4_INNOVATIONS.md)
- **API Docs**: Swagger UI at each service endpoint
- **Email**: integration@brainsait.com

---

**Happy Integrating! 🚀**
