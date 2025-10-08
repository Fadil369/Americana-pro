"""
BRAINSAIT: Test suite for AI Forecasting Service
Tests demand forecasting, dynamic pricing, churn prediction, and anomaly detection
"""

import pytest
from fastapi.testclient import TestClient
from main import app, forecaster, pricing_optimizer, churn_predictor, anomaly_detector

client = TestClient(app)


class TestDemandForecasting:
    """Test demand forecasting functionality"""
    
    def test_root_endpoint(self):
        """Test service info endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert "SSDP AI Forecasting Service" in response.json()["message"]
    
    def test_demand_forecast_default(self):
        """Test demand forecast with default parameters"""
        response = client.get("/forecast/demand")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "predictions" in data
        assert len(data["predictions"]) == 30  # Default 30 days
    
    def test_demand_forecast_custom_days(self):
        """Test demand forecast with custom days"""
        response = client.get("/forecast/demand?days_ahead=7&region=Jeddah")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["predictions"]) == 7
        assert data["region"] == "Jeddah"
    
    def test_demand_forecast_structure(self):
        """Test forecast response structure"""
        response = client.get("/forecast/demand?days_ahead=1")
        data = response.json()
        prediction = data["predictions"][0]
        
        assert "date" in prediction
        assert "region" in prediction
        assert "forecasted_units" in prediction
        assert "cultural_multiplier" in prediction
        assert "seasonal_factor" in prediction
        assert "confidence" in prediction
        assert "reason_ar" in prediction
        assert "reason_en" in prediction
    
    def test_cultural_multiplier(self):
        """Test cultural multiplier calculation"""
        from datetime import datetime
        
        # Test Ramadan period
        ramadan_date = datetime(2024, 3, 15)
        multiplier = forecaster.get_cultural_multiplier(ramadan_date)
        assert multiplier > 1.0, "Ramadan should have increased demand"
        
        # Test regular day
        regular_date = datetime(2024, 1, 10)
        multiplier = forecaster.get_cultural_multiplier(regular_date)
        assert multiplier == 1.0 or multiplier == 1.4, "Regular day should have base multiplier"


class TestDynamicPricing:
    """Test dynamic pricing optimization"""
    
    def test_pricing_optimization(self):
        """Test price optimization endpoint"""
        response = client.get(
            "/pricing/optimize?product_id=PRD001&current_inventory=100&demand_forecast=1500"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "optimized_price" in data
        assert "base_price" in data
        assert "factors" in data
    
    def test_pricing_with_competitor(self):
        """Test pricing with competitor price"""
        response = client.get(
            "/pricing/optimize?product_id=PRD001&current_inventory=100&demand_forecast=1000&competitor_price=26.5"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "competitor_factor" in data["factors"]
    
    def test_pricing_low_inventory(self):
        """Test pricing with low inventory (should increase price)"""
        result = pricing_optimizer.optimize_price("PRD001", 30, 1000)
        assert result["optimized_price"] >= result["base_price"], "Low inventory should increase price"
    
    def test_pricing_high_inventory(self):
        """Test pricing with high inventory (should decrease price)"""
        result = pricing_optimizer.optimize_price("PRD001", 1500, 500)
        assert result["optimized_price"] <= result["base_price"], "High inventory should decrease price"
    
    def test_pricing_bilingual_recommendations(self):
        """Test bilingual recommendations"""
        result = pricing_optimizer.optimize_price("PRD001", 100, 1000)
        assert "recommendation_ar" in result
        assert "recommendation_en" in result
        assert len(result["recommendation_ar"]) > 0
        assert len(result["recommendation_en"]) > 0


class TestChurnPrediction:
    """Test customer churn prediction"""
    
    def test_churn_prediction_endpoint(self):
        """Test churn prediction endpoint"""
        response = client.get(
            "/churn/predict?outlet_id=OUT001&days_since_last_order=45&average_order_value=2500&order_frequency=2"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "churn_probability" in data
        assert "risk_level" in data
    
    def test_high_risk_churn(self):
        """Test high risk churn prediction"""
        result = churn_predictor.predict_churn("OUT001", 90, 800, 0.5)
        assert result["risk_level"] == "high", "Should be high risk with long absence and low orders"
        assert result["churn_probability"] > 0.7
    
    def test_low_risk_churn(self):
        """Test low risk churn prediction"""
        result = churn_predictor.predict_churn("OUT002", 5, 5000, 4)
        assert result["risk_level"] == "low", "Should be low risk with recent orders and high value"
        assert result["churn_probability"] < 0.4
    
    def test_churn_recommendations(self):
        """Test churn recommendations"""
        result = churn_predictor.predict_churn("OUT003", 60, 1500, 1)
        assert "recommendations_ar" in result
        assert "recommendations_en" in result
        assert len(result["recommendations_ar"]) > 0
        assert len(result["recommendations_en"]) > 0


class TestInventoryRestock:
    """Test inventory restock recommendations"""
    
    def test_restock_recommendations(self):
        """Test restock recommendations endpoint"""
        request_data = {
            "products": [
                {"id": "PRD001", "current_stock": 100},
                {"id": "PRD002", "current_stock": 500}
            ],
            "region": "Riyadh"
        }
        response = client.post("/inventory/restock-recommendations", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "recommendations" in data
        assert len(data["recommendations"]) == 2
    
    def test_critical_urgency(self):
        """Test critical urgency detection"""
        request_data = {
            "products": [{"id": "PRD001", "current_stock": 10}],
            "region": "Riyadh"
        }
        response = client.post("/inventory/restock-recommendations", json=request_data)
        data = response.json()
        recommendation = data["recommendations"][0]
        assert recommendation["urgency"] in ["critical", "high"]


class TestAnomalyDetection:
    """Test anomaly detection"""
    
    def test_anomaly_detection_endpoint(self):
        """Test anomaly detection endpoint"""
        data_points = [
            {"date": "2024-01-01", "value": 1000},
            {"date": "2024-01-02", "value": 1100},
            {"date": "2024-01-03", "value": 1050},
            {"date": "2024-01-04", "value": 5000},  # Anomaly
            {"date": "2024-01-05", "value": 1000},
        ] * 2  # Repeat to get 10 points
        
        request_data = {"data_points": data_points}
        response = client.post("/analytics/anomaly-detection", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "anomalies" in data
    
    def test_anomaly_detector_insufficient_data(self):
        """Test with insufficient data points"""
        result = anomaly_detector.detect_anomalies([{"value": 100}])
        assert result["status"] == "insufficient_data"
    
    def test_anomaly_detector_statistics(self):
        """Test anomaly detection statistics"""
        data_points = [{"value": 1000 + i*10} for i in range(20)]
        result = anomaly_detector.detect_anomalies(data_points)
        assert "statistics" in result
        assert "mean" in result["statistics"]
        assert "std" in result["statistics"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
