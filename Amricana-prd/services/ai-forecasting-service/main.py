from fastapi import FastAPI
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import joblib
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler

app = FastAPI(
    title="SSDP AI Forecasting Service",
    description="AI-powered demand forecasting for Saudi sweet distribution",
    version="1.0.0"
)

class SweetDemandForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def get_cultural_multiplier(self, date: datetime) -> float:
        """Get demand multiplier based on Saudi cultural calendar"""
        month = date.month
        day = date.day
        
        # Ramadan surge (approximate - needs Hijri calendar integration)
        if month in [3, 4, 5]:  # Ramadan period varies
            return 4.5
        
        # Eid periods
        if (month == 5 and day <= 7) or (month == 7 and day <= 7):
            return 9.0
        
        # Saudi National Day
        if month == 9 and day == 23:
            return 2.5
        
        # Weekend (Thursday-Friday in Saudi)
        if date.weekday() in [3, 4]:
            return 1.4
        
        return 1.0
    
    def get_seasonal_factor(self, date: datetime) -> float:
        """Seasonal adjustment for Saudi climate"""
        month = date.month
        
        # Cooler months (higher sweet consumption)
        if month in [11, 12, 1, 2]:
            return 1.25
        # Hot summer months
        elif month in [6, 7, 8]:
            return 0.85
        else:
            return 1.0
    
    def forecast_demand(self, days_ahead: int = 30, region: str = "Riyadh") -> List[Dict]:
        """Generate demand forecast"""
        forecast_dates = pd.date_range(
            start=datetime.now(),
            periods=days_ahead,
            freq='D'
        )
        
        predictions = []
        
        for date in forecast_dates:
            # Base demand (mock historical average)
            base_demand = 1000 + np.random.normal(0, 100)
            
            # Apply cultural and seasonal factors
            cultural_factor = self.get_cultural_multiplier(date)
            seasonal_factor = self.get_seasonal_factor(date)
            
            forecasted_demand = base_demand * cultural_factor * seasonal_factor
            
            predictions.append({
                "date": date.isoformat(),
                "region": region,
                "forecasted_units": round(forecasted_demand, 2),
                "cultural_multiplier": cultural_factor,
                "seasonal_factor": seasonal_factor,
                "confidence": 0.85,
                "reason_ar": self._get_reason_arabic(date, cultural_factor),
                "reason_en": self._get_reason_english(date, cultural_factor)
            })
        
        return predictions
    
    def _get_reason_arabic(self, date: datetime, multiplier: float) -> str:
        if multiplier > 4:
            return "فترة رمضان - زيادة كبيرة في الطلب"
        elif multiplier > 8:
            return "عيد الفطر - ذروة الطلب"
        elif multiplier > 2:
            return "اليوم الوطني السعودي"
        elif multiplier > 1.3:
            return "نهاية الأسبوع"
        else:
            return "يوم عادي"
    
    def _get_reason_english(self, date: datetime, multiplier: float) -> str:
        if multiplier > 4:
            return "Ramadan period - High demand surge"
        elif multiplier > 8:
            return "Eid celebration - Peak demand"
        elif multiplier > 2:
            return "Saudi National Day"
        elif multiplier > 1.3:
            return "Weekend"
        else:
            return "Regular day"

class DynamicPricingOptimizer:
    """BRAINSAIT: Dynamic pricing based on demand, inventory, and competition"""
    
    def __init__(self):
        # Base prices for products (SAR)
        self.base_prices = {
            "PRD001": 25.0,  # Baklava
            "PRD002": 30.0,  # Kunafa
            "PRD003": 22.0,  # Maamoul
        }
    
    def optimize_price(
        self,
        product_id: str,
        current_inventory: int,
        demand_forecast: float,
        competitor_price: Optional[float] = None
    ) -> Dict:
        """Calculate optimal price based on multiple factors"""
        base_price = self.base_prices.get(product_id, 25.0)
        
        # Inventory factor (low inventory = higher price)
        if current_inventory < 50:
            inventory_factor = 1.15
        elif current_inventory < 200:
            inventory_factor = 1.05
        elif current_inventory > 1000:
            inventory_factor = 0.92
        else:
            inventory_factor = 1.0
        
        # Demand factor (high demand = higher price)
        if demand_forecast > 1000:
            demand_factor = 1.08
        elif demand_forecast > 500:
            demand_factor = 1.05
        elif demand_forecast < 500:
            demand_factor = 0.95
        else:
            demand_factor = 1.0
        
        # Competitor factor
        competitor_factor = 1.0
        if competitor_price:
            if competitor_price > base_price * 1.1:
                competitor_factor = 1.05  # Price slightly higher
            elif competitor_price < base_price * 0.9:
                competitor_factor = 0.95  # Match or beat competitor
        
        # Calculate optimized price
        optimized_price = base_price * inventory_factor * demand_factor * competitor_factor
        
        # Round to nearest 0.5
        optimized_price = round(optimized_price * 2) / 2
        
        return {
            "product_id": product_id,
            "base_price": base_price,
            "optimized_price": optimized_price,
            "price_change_percentage": round((optimized_price - base_price) / base_price * 100, 2),
            "factors": {
                "inventory_factor": inventory_factor,
                "demand_factor": demand_factor,
                "competitor_factor": competitor_factor
            },
            "recommendation_ar": self._get_recommendation_ar(optimized_price, base_price),
            "recommendation_en": self._get_recommendation_en(optimized_price, base_price)
        }
    
    def _get_recommendation_ar(self, optimized: float, base: float) -> str:
        if optimized > base * 1.05:
            return "زيادة السعر - الطلب مرتفع والمخزون منخفض"
        elif optimized < base * 0.95:
            return "تخفيض السعر - تصريف المخزون الزائد"
        else:
            return "الحفاظ على السعر الحالي"
    
    def _get_recommendation_en(self, optimized: float, base: float) -> str:
        if optimized > base * 1.05:
            return "Increase price - High demand and low inventory"
        elif optimized < base * 0.95:
            return "Reduce price - Clear excess inventory"
        else:
            return "Maintain current price"


class ChurnPredictor:
    """BRAINSAIT: Predict customer churn risk"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.is_trained = False
    
    def predict_churn(
        self,
        outlet_id: str,
        days_since_last_order: int,
        average_order_value: float,
        order_frequency: float
    ) -> Dict:
        """Predict churn probability for a customer"""
        
        # Simple rule-based churn prediction
        churn_score = 0.0
        
        # Days since last order (30+ days is concerning)
        if days_since_last_order > 60:
            churn_score += 0.4
        elif days_since_last_order > 30:
            churn_score += 0.2
        
        # Order frequency (less than 1 order per month is concerning)
        if order_frequency < 1:
            churn_score += 0.3
        elif order_frequency < 2:
            churn_score += 0.15
        
        # Average order value (declining value is concerning)
        if average_order_value < 1000:
            churn_score += 0.2
        elif average_order_value < 2000:
            churn_score += 0.1
        
        churn_score = min(churn_score, 1.0)
        
        # Determine risk level
        if churn_score > 0.7:
            risk_level = "high"
            risk_level_ar = "مرتفع"
        elif churn_score > 0.4:
            risk_level = "medium"
            risk_level_ar = "متوسط"
        else:
            risk_level = "low"
            risk_level_ar = "منخفض"
        
        return {
            "outlet_id": outlet_id,
            "churn_probability": round(churn_score, 3),
            "risk_level": risk_level,
            "risk_level_ar": risk_level_ar,
            "factors": {
                "days_since_last_order": days_since_last_order,
                "average_order_value": average_order_value,
                "order_frequency": order_frequency
            },
            "recommendations_ar": self._get_recommendations_ar(risk_level),
            "recommendations_en": self._get_recommendations_en(risk_level)
        }
    
    def _get_recommendations_ar(self, risk_level: str) -> List[str]:
        if risk_level == "high":
            return [
                "التواصل الفوري مع العميل",
                "تقديم عروض خاصة أو خصومات",
                "زيارة ميدانية من مندوب المبيعات"
            ]
        elif risk_level == "medium":
            return [
                "إرسال رسالة ترويجية",
                "تقديم منتجات جديدة",
                "المتابعة الدورية"
            ]
        else:
            return ["الحفاظ على الخدمة الحالية"]
    
    def _get_recommendations_en(self, risk_level: str) -> List[str]:
        if risk_level == "high":
            return [
                "Immediate customer contact",
                "Offer special promotions or discounts",
                "Schedule sales rep visit"
            ]
        elif risk_level == "medium":
            return [
                "Send promotional message",
                "Introduce new products",
                "Regular follow-up"
            ]
        else:
            return ["Maintain current service level"]


class AnomalyDetector:
    """BRAINSAIT: Detect anomalies in sales and operations data"""
    
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
    
    def detect_anomalies(self, data_points: List[Dict]) -> Dict:
        """Detect anomalies in time-series data"""
        if len(data_points) < 10:
            return {
                "status": "insufficient_data",
                "message": "Need at least 10 data points for anomaly detection"
            }
        
        # Extract values
        values = [point.get("value", 0) for point in data_points]
        
        # Simple statistical anomaly detection
        mean = np.mean(values)
        std = np.std(values)
        
        anomalies = []
        for i, point in enumerate(data_points):
            value = point.get("value", 0)
            z_score = abs((value - mean) / std) if std > 0 else 0
            
            if z_score > 2.5:  # More than 2.5 standard deviations
                anomalies.append({
                    "index": i,
                    "date": point.get("date"),
                    "value": value,
                    "z_score": round(z_score, 2),
                    "severity": "high" if z_score > 3 else "medium"
                })
        
        return {
            "status": "success",
            "total_points": len(data_points),
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies,
            "statistics": {
                "mean": round(mean, 2),
                "std": round(std, 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2)
            }
        }


# Initialize services
forecaster = SweetDemandForecaster()
pricing_optimizer = DynamicPricingOptimizer()
churn_predictor = ChurnPredictor()
anomaly_detector = AnomalyDetector()

@app.get("/")
async def root():
    return {"message": "SSDP AI Forecasting Service", "version": "1.0.0"}

@app.get("/forecast/demand")
async def get_demand_forecast(days_ahead: int = 30, region: str = "Riyadh"):
    """Get demand forecast for specified region and time period"""
    try:
        forecast = forecaster.forecast_demand(days_ahead, region)
        return {
            "status": "success",
            "region": region,
            "forecast_period": f"{days_ahead} days",
            "generated_at": datetime.now().isoformat(),
            "predictions": forecast
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/forecast/products")
async def get_product_forecast():
    """Get product-specific demand forecast"""
    products = [
        {"id": "PRD001", "name": "بقلاوة", "name_en": "Baklava"},
        {"id": "PRD002", "name": "كنافة", "name_en": "Kunafa"},
        {"id": "PRD003", "name": "معمول", "name_en": "Maamoul"}
    ]
    
    forecasts = []
    for product in products:
        base_forecast = forecaster.forecast_demand(7, "Riyadh")
        # Adjust for product-specific factors
        for prediction in base_forecast:
            if product["id"] == "PRD001":  # Baklava more popular in winter
                prediction["forecasted_units"] *= 1.2
            elif product["id"] == "PRD003":  # Maamoul peaks during Eid
                if prediction["cultural_multiplier"] > 8:
                    prediction["forecasted_units"] *= 1.5
        
        forecasts.append({
            "product": product,
            "forecast": base_forecast[:7]  # 7 days
        })
    
    return {"product_forecasts": forecasts}


@app.get("/pricing/optimize")
async def optimize_pricing(
    product_id: str,
    current_inventory: int,
    demand_forecast: float,
    competitor_price: Optional[float] = None
):
    """BRAINSAIT: Get optimized pricing recommendations"""
    try:
        optimization = pricing_optimizer.optimize_price(
            product_id,
            current_inventory,
            demand_forecast,
            competitor_price
        )
        return {
            "status": "success",
            "generated_at": datetime.now().isoformat(),
            **optimization
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/churn/predict")
async def predict_churn(
    outlet_id: str,
    days_since_last_order: int,
    average_order_value: float,
    order_frequency: float
):
    """BRAINSAIT: Predict customer churn risk"""
    try:
        prediction = churn_predictor.predict_churn(
            outlet_id,
            days_since_last_order,
            average_order_value,
            order_frequency
        )
        return {
            "status": "success",
            "generated_at": datetime.now().isoformat(),
            **prediction
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/inventory/restock-recommendations")
async def get_restock_recommendations(request_data: Dict):
    """BRAINSAIT: Get AI-powered inventory restock recommendations"""
    try:
        products = request_data.get("products", [])
        region = request_data.get("region", "Riyadh")
        
        recommendations = []
        
        for product in products:
            product_id = product.get("id")
            current_stock = product.get("current_stock", 0)
            
            # Get 7-day demand forecast
            forecast = forecaster.forecast_demand(7, region)
            total_forecasted = sum([p["forecasted_units"] for p in forecast])
            
            # Calculate restock quantity
            safety_stock = total_forecasted * 0.2  # 20% buffer
            reorder_quantity = max(0, total_forecasted + safety_stock - current_stock)
            
            # Determine urgency
            if current_stock < total_forecasted * 0.3:
                urgency = "critical"
                urgency_ar = "حرج"
            elif current_stock < total_forecasted * 0.5:
                urgency = "high"
                urgency_ar = "عالي"
            elif current_stock < total_forecasted:
                urgency = "medium"
                urgency_ar = "متوسط"
            else:
                urgency = "low"
                urgency_ar = "منخفض"
            
            recommendations.append({
                "product_id": product_id,
                "current_stock": current_stock,
                "forecasted_demand_7d": round(total_forecasted, 2),
                "recommended_restock": round(reorder_quantity, 2),
                "urgency": urgency,
                "urgency_ar": urgency_ar,
                "estimated_stockout_days": round(current_stock / (total_forecasted / 7), 1) if total_forecasted > 0 else 999
            })
        
        return {
            "status": "success",
            "region": region,
            "generated_at": datetime.now().isoformat(),
            "recommendations": recommendations
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/analytics/anomaly-detection")
async def detect_anomalies(request_data: Dict):
    """BRAINSAIT: Detect anomalies in sales/operations data"""
    try:
        data_points = request_data.get("data_points", [])
        
        if not data_points:
            return {
                "status": "error",
                "message": "No data points provided"
            }
        
        result = anomaly_detector.detect_anomalies(data_points)
        
        return {
            "status": result.get("status", "success"),
            "generated_at": datetime.now().isoformat(),
            **result
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
