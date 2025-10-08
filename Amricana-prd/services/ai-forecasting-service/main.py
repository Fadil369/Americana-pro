# BRAINSAIT: AI Forecasting service for SSDP platform
# DISTRIBUTIONLINC: AI-powered intelligence layer
# NEURAL: Machine learning demand forecasting and optimization

from fastapi import FastAPI
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import joblib
from sklearn.ensemble import RandomForestRegressor
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

# Initialize forecaster
forecaster = SweetDemandForecaster()

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

class DynamicPricingOptimizer:
    """BRAINSAIT: Dynamic pricing based on demand, inventory, and competition"""
    
    def __init__(self):
        self.base_prices = {
            "PRD001": 25.0,  # Baklava
            "PRD002": 35.0,  # Kunafa
            "PRD003": 20.0,  # Maamoul
            "PRD004": 30.0,  # Basbousa
            "PRD005": 28.0,  # Qatayef
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
        inventory_factor = 1.0
        if current_inventory < 50:
            inventory_factor = 1.15
        elif current_inventory < 100:
            inventory_factor = 1.08
        elif current_inventory > 500:
            inventory_factor = 0.92  # Discount to move inventory
        
        # Demand factor (high demand = higher price)
        demand_factor = 1.0
        if demand_forecast > 1500:
            demand_factor = 1.12
        elif demand_forecast > 1000:
            demand_factor = 1.05
        elif demand_forecast < 500:
            demand_factor = 0.95
        
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
        change = (optimized - base) / base * 100
        if change > 5:
            return "يُنصح بزيادة السعر لزيادة الربحية"
        elif change < -5:
            return "يُنصح بتخفيض السعر لزيادة المبيعات"
        else:
            return "السعر الحالي مثالي"
    
    def _get_recommendation_en(self, optimized: float, base: float) -> str:
        change = (optimized - base) / base * 100
        if change > 5:
            return "Recommend price increase for higher profitability"
        elif change < -5:
            return "Recommend price reduction to boost sales"
        else:
            return "Current price is optimal"

class CustomerChurnPredictor:
    """BRAINSAIT: Predict customer churn and retention strategies"""
    
    def predict_churn_risk(
        self,
        outlet_id: str,
        days_since_last_order: int,
        average_order_value: float,
        order_frequency: float,
        payment_delays: int
    ) -> Dict:
        """Calculate churn risk score and recommendations"""
        
        # Calculate risk factors
        recency_risk = min(days_since_last_order / 30, 1.0)  # Max 1.0
        value_risk = 1.0 - min(average_order_value / 5000, 1.0)  # Inverse
        frequency_risk = 1.0 - min(order_frequency / 4, 1.0)  # 4 orders/month is good
        payment_risk = min(payment_delays / 5, 1.0)  # Max 1.0
        
        # Weighted churn score
        churn_score = (
            recency_risk * 0.35 +
            value_risk * 0.25 +
            frequency_risk * 0.25 +
            payment_risk * 0.15
        ) * 100
        
        # Determine risk level
        if churn_score > 70:
            risk_level = "high"
            risk_level_ar = "عالي"
        elif churn_score > 40:
            risk_level = "medium"
            risk_level_ar = "متوسط"
        else:
            risk_level = "low"
            risk_level_ar = "منخفض"
        
        # Generate retention strategies
        strategies = self._get_retention_strategies(
            recency_risk, value_risk, frequency_risk, payment_risk
        )
        
        return {
            "outlet_id": outlet_id,
            "churn_score": round(churn_score, 2),
            "risk_level": risk_level,
            "risk_level_ar": risk_level_ar,
            "risk_factors": {
                "recency": round(recency_risk * 100, 2),
                "value": round(value_risk * 100, 2),
                "frequency": round(frequency_risk * 100, 2),
                "payment": round(payment_risk * 100, 2)
            },
            "retention_strategies": strategies
        }
    
    def _get_retention_strategies(
        self,
        recency_risk: float,
        value_risk: float,
        frequency_risk: float,
        payment_risk: float
    ) -> List[Dict]:
        """Generate retention strategies based on risk factors"""
        strategies = []
        
        if recency_risk > 0.5:
            strategies.append({
                "priority": "high",
                "action_en": "Schedule immediate visit to re-engage customer",
                "action_ar": "جدولة زيارة فورية لإعادة التواصل مع العميل",
                "type": "visit"
            })
        
        if value_risk > 0.5:
            strategies.append({
                "priority": "medium",
                "action_en": "Offer volume discount to increase order size",
                "action_ar": "تقديم خصم على الكميات لزيادة حجم الطلب",
                "type": "discount"
            })
        
        if frequency_risk > 0.5:
            strategies.append({
                "priority": "medium",
                "action_en": "Introduce loyalty program with rewards",
                "action_ar": "تقديم برنامج ولاء مع مكافآت",
                "type": "loyalty"
            })
        
        if payment_risk > 0.5:
            strategies.append({
                "priority": "high",
                "action_en": "Review credit terms and offer flexible payment options",
                "action_ar": "مراجعة شروط الائتمان وتقديم خيارات دفع مرنة",
                "type": "credit"
            })
        
        return strategies

class InventoryOrchestrator:
    """BRAINSAIT: Predictive restocking and automated purchase suggestions"""
    
    def generate_restocking_recommendations(
        self,
        current_inventory: Dict[str, int],
        demand_forecast: Dict[str, float],
        lead_time_days: int = 3,
        safety_stock_multiplier: float = 1.5
    ) -> List[Dict]:
        """Generate purchase order recommendations"""
        recommendations = []
        
        for product_id, current_stock in current_inventory.items():
            forecasted_demand = demand_forecast.get(product_id, 0)
            
            # Calculate required stock
            daily_demand = forecasted_demand / 30  # Assuming 30-day forecast
            lead_time_demand = daily_demand * lead_time_days
            safety_stock = daily_demand * 7 * safety_stock_multiplier  # 7 days safety
            reorder_point = lead_time_demand + safety_stock
            
            # Calculate order quantity
            if current_stock < reorder_point:
                order_quantity = int((daily_demand * 30) - current_stock)  # 30 days supply
                
                recommendations.append({
                    "product_id": product_id,
                    "current_stock": current_stock,
                    "forecasted_daily_demand": round(daily_demand, 2),
                    "reorder_point": round(reorder_point, 2),
                    "recommended_order_quantity": order_quantity,
                    "urgency": "high" if current_stock < safety_stock else "medium",
                    "days_until_stockout": int(current_stock / daily_demand) if daily_demand > 0 else 999,
                    "reason_en": f"Stock below reorder point ({round(reorder_point, 2)} units)",
                    "reason_ar": f"المخزون أقل من نقطة إعادة الطلب ({round(reorder_point, 2)} وحدة)"
                })
        
        # Sort by urgency
        recommendations.sort(key=lambda x: (x["urgency"] == "high", -x["days_until_stockout"]), reverse=True)
        
        return recommendations

# Initialize optimizers
pricing_optimizer = DynamicPricingOptimizer()
churn_predictor = CustomerChurnPredictor()
inventory_orchestrator = InventoryOrchestrator()

@app.get("/pricing/optimize")
async def optimize_pricing(
    product_id: str,
    current_inventory: int,
    demand_forecast: float,
    competitor_price: Optional[float] = None
):
    """DISTRIBUTIONLINC: Dynamic pricing optimization"""
    result = pricing_optimizer.optimize_price(
        product_id, current_inventory, demand_forecast, competitor_price
    )
    return {
        "status": "success",
        "optimization": result,
        "generated_at": datetime.now().isoformat()
    }

@app.get("/churn/predict")
async def predict_churn(
    outlet_id: str,
    days_since_last_order: int,
    average_order_value: float,
    order_frequency: float,
    payment_delays: int = 0
):
    """DISTRIBUTIONLINC: Customer churn prediction"""
    result = churn_predictor.predict_churn_risk(
        outlet_id, days_since_last_order, average_order_value,
        order_frequency, payment_delays
    )
    return {
        "status": "success",
        "prediction": result,
        "generated_at": datetime.now().isoformat()
    }

@app.post("/inventory/restock-recommendations")
async def get_restock_recommendations(
    request: Dict
):
    """DISTRIBUTIONLINC: Inventory orchestrator recommendations"""
    current_inventory = request.get("current_inventory", {})
    demand_forecast = request.get("demand_forecast", {})
    lead_time_days = request.get("lead_time_days", 3)
    
    recommendations = inventory_orchestrator.generate_restocking_recommendations(
        current_inventory, demand_forecast, lead_time_days
    )
    
    return {
        "status": "success",
        "recommendations": recommendations,
        "total_recommendations": len(recommendations),
        "high_urgency_count": sum(1 for r in recommendations if r["urgency"] == "high"),
        "generated_at": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
