# SSDP Advanced Analytics & AI API Documentation

## Overview
This document describes the Advanced Analytics & AI features implemented for the Smart Sweet Distribution Platform (SSDP), including demand forecasting, dynamic pricing, churn prediction, route optimization, and anomaly detection.

---

## AI Forecasting Service (Port 8001)

### Base URL
```
http://localhost:8001
```

### Endpoints

#### 1. Demand Forecasting

**Endpoint:** `GET /forecast/demand`

**Description:** Generate demand forecast based on cultural calendar, seasonal factors, and regional patterns.

**Parameters:**
- `days_ahead` (integer, default: 30): Number of days to forecast
- `region` (string, default: "Riyadh"): Region for forecast (Riyadh, Jeddah, Dammam, etc.)

**Example Request:**
```bash
curl "http://localhost:8001/forecast/demand?days_ahead=30&region=Riyadh"
```

**Example Response:**
```json
{
  "status": "success",
  "region": "Riyadh",
  "forecast_period": "30 days",
  "generated_at": "2024-01-15T10:30:00",
  "predictions": [
    {
      "date": "2024-01-16T00:00:00",
      "region": "Riyadh",
      "forecasted_units": 4500.0,
      "cultural_multiplier": 4.5,
      "seasonal_factor": 1.25,
      "confidence": 0.85,
      "reason_ar": "فترة رمضان - زيادة كبيرة في الطلب",
      "reason_en": "Ramadan period - High demand surge"
    }
  ]
}
```

**Key Features:**
- ✅ Ramadan/Eid surge detection
- ✅ Saudi weekend patterns (Thursday-Friday)
- ✅ National Day adjustments
- ✅ Seasonal climate factors
- ✅ Bilingual explanations

---

#### 2. Dynamic Pricing Optimization

**Endpoint:** `GET /pricing/optimize`

**Description:** Calculate optimal pricing based on inventory levels, demand forecasts, and competitor prices.

**Parameters:**
- `product_id` (string, required): Product identifier
- `current_inventory` (integer, required): Current stock level
- `demand_forecast` (float, required): Forecasted demand
- `competitor_price` (float, optional): Competitor price for comparison

**Example Request:**
```bash
curl "http://localhost:8001/pricing/optimize?product_id=PRD001&current_inventory=100&demand_forecast=1500&competitor_price=26.5"
```

**Example Response:**
```json
{
  "status": "success",
  "generated_at": "2024-01-15T10:30:00",
  "product_id": "PRD001",
  "base_price": 25.0,
  "optimized_price": 27.5,
  "price_change_percentage": 10.0,
  "factors": {
    "inventory_factor": 1.15,
    "demand_factor": 1.08,
    "competitor_factor": 1.05
  },
  "recommendation_ar": "زيادة السعر - الطلب مرتفع والمخزون منخفض",
  "recommendation_en": "Increase price - High demand and low inventory"
}
```

**Pricing Logic:**
- **Low inventory (<50)**: Price increase (+15%)
- **High inventory (>1000)**: Price decrease (-8%)
- **High demand (>1000)**: Price increase (+8%)
- **Competitor analysis**: Match or beat competitor prices

---

#### 3. Customer Churn Prediction

**Endpoint:** `GET /churn/predict`

**Description:** Predict customer churn risk and provide retention recommendations.

**Parameters:**
- `outlet_id` (string, required): Outlet identifier
- `days_since_last_order` (integer, required): Days since last order
- `average_order_value` (float, required): Average order value (SAR)
- `order_frequency` (float, required): Orders per month

**Example Request:**
```bash
curl "http://localhost:8001/churn/predict?outlet_id=OUT001&days_since_last_order=45&average_order_value=2500&order_frequency=2"
```

**Example Response:**
```json
{
  "status": "success",
  "generated_at": "2024-01-15T10:30:00",
  "outlet_id": "OUT001",
  "churn_probability": 0.35,
  "risk_level": "medium",
  "risk_level_ar": "متوسط",
  "factors": {
    "days_since_last_order": 45,
    "average_order_value": 2500,
    "order_frequency": 2
  },
  "recommendations_ar": [
    "إرسال رسالة ترويجية",
    "تقديم منتجات جديدة",
    "المتابعة الدورية"
  ],
  "recommendations_en": [
    "Send promotional message",
    "Introduce new products",
    "Regular follow-up"
  ]
}
```

**Risk Levels:**
- **High (>0.7)**: Immediate action required
- **Medium (0.4-0.7)**: Proactive engagement needed
- **Low (<0.4)**: Maintain current service

---

#### 4. Inventory Restock Recommendations

**Endpoint:** `POST /inventory/restock-recommendations`

**Description:** Get AI-powered restock recommendations based on demand forecasts.

**Request Body:**
```json
{
  "products": [
    {"id": "PRD001", "current_stock": 100},
    {"id": "PRD002", "current_stock": 500}
  ],
  "region": "Riyadh"
}
```

**Example Response:**
```json
{
  "status": "success",
  "region": "Riyadh",
  "generated_at": "2024-01-15T10:30:00",
  "recommendations": [
    {
      "product_id": "PRD001",
      "current_stock": 100,
      "forecasted_demand_7d": 7500.0,
      "recommended_restock": 9000.0,
      "urgency": "critical",
      "urgency_ar": "حرج",
      "estimated_stockout_days": 0.9
    }
  ]
}
```

**Urgency Levels:**
- **Critical**: Stock < 30% of 7-day forecast
- **High**: Stock < 50% of 7-day forecast
- **Medium**: Stock < 100% of 7-day forecast
- **Low**: Adequate stock

---

#### 5. Anomaly Detection

**Endpoint:** `POST /analytics/anomaly-detection`

**Description:** Detect anomalies in sales and operations data using statistical methods.

**Request Body:**
```json
{
  "data_points": [
    {"date": "2024-01-01", "value": 1000},
    {"date": "2024-01-02", "value": 1100},
    {"date": "2024-01-03", "value": 5000}
  ]
}
```

**Example Response:**
```json
{
  "status": "success",
  "generated_at": "2024-01-15T10:30:00",
  "total_points": 30,
  "anomalies_detected": 3,
  "anomalies": [
    {
      "index": 10,
      "date": "2024-01-10",
      "value": 90000,
      "z_score": 3.2,
      "severity": "high"
    }
  ],
  "statistics": {
    "mean": 45000,
    "std": 5000,
    "min": 30000,
    "max": 90000
  }
}
```

**Detection Method:**
- Uses Z-score (>2.5 standard deviations)
- Minimum 10 data points required
- Severity: high (>3σ) or medium (>2.5σ)

---

## Route Optimizer Worker

### Base URL
```
http://localhost:8787/optimize-route
```

### Endpoint

**Endpoint:** `POST /optimize-route`

**Description:** Optimize delivery routes using advanced algorithms.

**Request Body:**
```json
{
  "locations": [
    {"lat": 24.7136, "lng": 46.6753, "address": "Location 1", "priority": 1},
    {"lat": 24.7246, "lng": 46.6891, "address": "Location 2", "priority": 2}
  ],
  "vehicleCapacity": 1000,
  "startLocation": {"lat": 24.7136, "lng": 46.6753, "address": "Warehouse", "priority": 1},
  "algorithm": "genetic"
}
```

**Algorithm Options:**
- `nearest-neighbor` (default): Fast, greedy algorithm
- `genetic`: Population-based optimization with crossover/mutation
- `simulated-annealing`: Probabilistic hill climbing

**Example Response:**
```json
{
  "success": true,
  "optimizedRoute": {
    "sequence": [0, 2, 1, 4, 3],
    "totalDistance": 45.23,
    "estimatedTime": 54,
    "fuelCost": 22.62
  },
  "algorithm": "genetic",
  "generatedAt": "2024-01-15T10:30:00"
}
```

**Algorithm Comparison:**

| Algorithm | Time Complexity | Quality | Best For |
|-----------|----------------|---------|----------|
| Nearest Neighbor | O(n²) | Good | Quick results, <20 stops |
| Genetic Algorithm | O(n × generations) | Better | Balanced optimization |
| Simulated Annealing | O(n × iterations) | Best | Complex routes, >30 stops |

---

## Analytics Aggregator Worker

### Base URL
```
http://localhost:8787/analytics
```

### Endpoints

#### 1. Predictive Analytics

**Endpoint:** `GET /analytics/predictive`

**Description:** Get predictive analytics for sales, orders, or other metrics.

**Parameters:**
- `metric` (string, default: "sales"): Metric to predict
- `days_ahead` (integer, default: 30): Forecast period
- `region` (string, default: "Riyadh"): Region filter

**Example Request:**
```bash
curl "http://localhost:8787/analytics/predictive?metric=sales&days_ahead=30&region=Riyadh"
```

**Example Response:**
```json
{
  "success": true,
  "metric": "sales",
  "region": "Riyadh",
  "forecast_period": "30 days",
  "generated_at": "2024-01-15T10:30:00",
  "predictions": [
    {
      "date": "2024-01-16",
      "forecasted_value": 50500.0,
      "confidence_lower": 42925.0,
      "confidence_upper": 58075.0,
      "confidence_level": 0.85
    }
  ],
  "insights_ar": [
    "اتجاه نمو إيجابي متوقع",
    "تقلبات موسمية خلال الفترة"
  ],
  "insights_en": [
    "Positive growth trend expected",
    "Seasonal fluctuations during period"
  ]
}
```

---

#### 2. Anomaly Detection

**Endpoint:** `GET /analytics/anomalies`

**Description:** Get detected anomalies in operational data.

**Parameters:**
- `data_type` (string, default: "sales"): Type of data
- `period` (string, default: "30d"): Analysis period

**Example Request:**
```bash
curl "http://localhost:8787/analytics/anomalies?data_type=sales&period=30d"
```

**Example Response:**
```json
{
  "success": true,
  "data_type": "sales",
  "period": "30d",
  "total_data_points": 30,
  "anomalies_detected": 3,
  "anomalies": [
    {
      "date": "2024-01-10",
      "value": 90000,
      "severity": "high",
      "type": "spike",
      "description_ar": "ارتفاع غير عادي في القيمة",
      "description_en": "Unusual spike in value"
    }
  ],
  "statistics": {
    "mean": 45000,
    "min": 30000,
    "max": 90000
  },
  "generated_at": "2024-01-15T10:30:00"
}
```

---

## Testing

### Running Tests

#### AI Forecasting Service Tests
```bash
cd Amricana-prd/services/ai-forecasting-service
pip install -r requirements.txt
pytest test_main.py -v
```

**Test Coverage:**
- ✅ 19 test cases
- ✅ Demand forecasting
- ✅ Dynamic pricing
- ✅ Churn prediction
- ✅ Inventory recommendations
- ✅ Anomaly detection

#### Route Optimizer Tests
```bash
cd Amricana-prd/workers/route-optimizer-worker/src
node test_index.ts
```

---

## Implementation Notes

### BRAINSAIT Integration
All AI features are tagged with `BRAINSAIT` comments for enterprise healthcare integration:
- OID namespace compatibility
- HIPAA-compliant audit logging ready
- FHIR R4 resource mapping prepared

### Bilingual Support
All endpoints provide responses in both Arabic and English:
- Recommendations
- Insights
- Risk levels
- Urgency indicators

### Cultural Context
Saudi-specific considerations:
- Ramadan/Eid demand surges
- Weekend patterns (Thursday-Friday)
- National holiday adjustments
- Regional variations

---

## Performance Metrics

### AI Forecasting Service
- **Demand Forecast**: <100ms for 30-day forecast
- **Dynamic Pricing**: <50ms per product
- **Churn Prediction**: <50ms per outlet
- **Anomaly Detection**: <200ms for 100 data points

### Route Optimization
- **Nearest Neighbor**: <100ms for 20 locations
- **Genetic Algorithm**: ~2s for 20 locations (100 generations)
- **Simulated Annealing**: ~3s for 20 locations (10,000 iterations)

---

## Future Enhancements

### Planned Features (Phase 4)
- [ ] LSTM models for time-series forecasting
- [ ] Transformer models for demand prediction
- [ ] Deep reinforcement learning for route optimization
- [ ] Real-time weather integration
- [ ] Traffic pattern analysis
- [ ] Multi-vehicle route planning
- [ ] Capacity constraint optimization

---

## Support

For questions or issues:
- GitHub Issues: https://github.com/Fadil369/Americana-pro/issues
- Documentation: See IMPLEMENTATION_GUIDE.md
- Architecture: See ARCHITECTURE.md

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Platform:** SSDP (Smart Sweet Distribution Platform)
