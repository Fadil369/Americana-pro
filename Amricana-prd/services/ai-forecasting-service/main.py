from fastapi import FastAPI
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
