# BRAINSAIT: Computer Vision Service for SSDP Platform
# MEDICAL: Product quality and compliance detection
# NEURAL: AI-powered image analysis for shelf compliance

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import base64
from enum import Enum

app = FastAPI(
    title="SSDP Computer Vision Service",
    description="AI-powered computer vision for shelf compliance, damage detection, and counterfeit identification",
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
class DetectionType(str, Enum):
    SHELF_COMPLIANCE = "shelf_compliance"
    DAMAGE_DETECTION = "damage_detection"
    COUNTERFEIT_CHECK = "counterfeit_check"
    EXPIRY_DATE_OCR = "expiry_date_ocr"
    PRODUCT_RECOGNITION = "product_recognition"

class ComplianceLevel(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class DamageLevel(str, Enum):
    NONE = "none"
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"

# Pydantic Models
class ShelfComplianceResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    outlet_id: str
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)
    compliance_score: float = Field(..., ge=0, le=100)
    compliance_level: ComplianceLevel
    issues_detected: List[str] = []
    recommendations: List[str] = []
    products_count: int
    out_of_stock_count: int
    misplaced_count: int
    shelf_coverage_percentage: float

class DamageDetectionResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: Optional[str] = None
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)
    damage_level: DamageLevel
    damage_types: List[str] = []
    confidence_score: float = Field(..., ge=0, le=1)
    action_required: bool
    recommendations: List[str] = []

class CounterfeitCheckResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_authentic: bool
    confidence_score: float = Field(..., ge=0, le=1)
    verification_features: List[str] = []
    anomalies_detected: List[str] = []
    recommendation: str

class ExpiryDateResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: Optional[str] = None
    expiry_date: Optional[str] = None
    days_until_expiry: Optional[int] = None
    is_expired: bool
    confidence_score: float = Field(..., ge=0, le=1)

# In-memory storage (replace with database in production)
analysis_history: Dict[str, List] = {
    "shelf_compliance": [],
    "damage_detection": [],
    "counterfeit_check": [],
    "expiry_date": []
}

# NEURAL: Simulated AI model for shelf compliance analysis
def analyze_shelf_compliance(image_data: bytes, outlet_id: str) -> ShelfComplianceResult:
    """
    NEURAL: Analyze shelf compliance using computer vision
    Checks: product placement, stock levels, organization
    """
    # AGENT: Simulated AI analysis (replace with actual CV model)
    import random
    
    products_count = random.randint(15, 50)
    out_of_stock = random.randint(0, 5)
    misplaced = random.randint(0, 8)
    
    shelf_coverage = ((products_count - out_of_stock) / products_count) * 100
    compliance_score = max(0, 100 - (out_of_stock * 5) - (misplaced * 3))
    
    # Determine compliance level
    if compliance_score >= 90:
        level = ComplianceLevel.EXCELLENT
    elif compliance_score >= 75:
        level = ComplianceLevel.GOOD
    elif compliance_score >= 60:
        level = ComplianceLevel.FAIR
    else:
        level = ComplianceLevel.POOR
    
    # Generate issues and recommendations
    issues = []
    recommendations = []
    
    if out_of_stock > 0:
        issues.append(f"{out_of_stock} products out of stock")
        recommendations.append("Restock out-of-stock items immediately")
    
    if misplaced > 0:
        issues.append(f"{misplaced} products misplaced")
        recommendations.append("Reorganize misplaced products according to planogram")
    
    if shelf_coverage < 80:
        issues.append("Low shelf coverage detected")
        recommendations.append("Increase product variety and stock levels")
    
    return ShelfComplianceResult(
        outlet_id=outlet_id,
        compliance_score=compliance_score,
        compliance_level=level,
        issues_detected=issues,
        recommendations=recommendations,
        products_count=products_count,
        out_of_stock_count=out_of_stock,
        misplaced_count=misplaced,
        shelf_coverage_percentage=shelf_coverage
    )

# NEURAL: Simulated AI model for damage detection
def detect_product_damage(image_data: bytes, product_id: Optional[str] = None) -> DamageDetectionResult:
    """
    NEURAL: Detect product damage using computer vision
    Checks: packaging integrity, dents, tears, contamination
    """
    import random
    
    # AGENT: Simulated damage detection
    damage_probability = random.random()
    
    if damage_probability < 0.7:
        damage_level = DamageLevel.NONE
        damage_types = []
        action_required = False
        recommendations = ["Product appears to be in good condition"]
    elif damage_probability < 0.85:
        damage_level = DamageLevel.MINOR
        damage_types = ["Minor packaging wear"]
        action_required = False
        recommendations = ["Monitor during next inspection", "Consider moving to front of shelf"]
    elif damage_probability < 0.95:
        damage_level = DamageLevel.MODERATE
        damage_types = ["Packaging dent", "Label damage"]
        action_required = True
        recommendations = ["Mark for discount sale", "Replace packaging if possible"]
    else:
        damage_level = DamageLevel.SEVERE
        damage_types = ["Severe packaging damage", "Possible contamination"]
        action_required = True
        recommendations = ["Remove from shelf immediately", "Document for supplier claim"]
    
    confidence = random.uniform(0.85, 0.99)
    
    return DamageDetectionResult(
        product_id=product_id,
        damage_level=damage_level,
        damage_types=damage_types,
        confidence_score=confidence,
        action_required=action_required,
        recommendations=recommendations
    )

# NEURAL: Simulated AI model for counterfeit detection
def check_counterfeit(image_data: bytes, product_id: str) -> CounterfeitCheckResult:
    """
    NEURAL: Check product authenticity using computer vision
    Verifies: holograms, QR codes, packaging quality, brand marks
    """
    import random
    
    # AGENT: Simulated counterfeit detection
    is_authentic = random.random() > 0.05  # 95% authentic rate
    confidence = random.uniform(0.88, 0.99)
    
    verification_features = [
        "Hologram verified",
        "QR code authentic",
        "Brand mark correct",
        "Packaging quality match"
    ]
    
    anomalies = []
    
    if not is_authentic:
        verification_features.remove("QR code authentic")
        anomalies = [
            "QR code mismatch",
            "Packaging quality below standard",
            "Printing quality inconsistent"
        ]
        recommendation = "⚠️ ALERT: Potential counterfeit detected. Remove from circulation and report to supplier."
    else:
        recommendation = "✅ Product verified as authentic. No action required."
    
    return CounterfeitCheckResult(
        product_id=product_id,
        is_authentic=is_authentic,
        confidence_score=confidence,
        verification_features=verification_features,
        anomalies_detected=anomalies,
        recommendation=recommendation
    )

# NEURAL: Simulated OCR for expiry date extraction
def extract_expiry_date(image_data: bytes, product_id: Optional[str] = None) -> ExpiryDateResult:
    """
    NEURAL: Extract expiry date using OCR (Arabic & English)
    BILINGUAL: Supports both Arabic and English date formats
    """
    import random
    from datetime import timedelta
    
    # AGENT: Simulated OCR extraction
    days_offset = random.randint(-30, 365)
    expiry_date = datetime.utcnow() + timedelta(days=days_offset)
    
    is_expired = days_offset < 0
    confidence = random.uniform(0.90, 0.99)
    
    return ExpiryDateResult(
        product_id=product_id,
        expiry_date=expiry_date.strftime("%Y-%m-%d"),
        days_until_expiry=days_offset,
        is_expired=is_expired,
        confidence_score=confidence
    )

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "SSDP Computer Vision Service API",
        "version": "1.0.0",
        "features": [
            "Shelf compliance analysis",
            "Product damage detection",
            "Counterfeit verification",
            "Expiry date OCR (Arabic/English)",
            "Product recognition"
        ],
        "detection_types": [dt.value for dt in DetectionType]
    }

@app.post("/analyze/shelf-compliance", response_model=ShelfComplianceResult)
async def analyze_shelf(
    outlet_id: str,
    image: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    NEURAL: Analyze shelf compliance from outlet image
    Returns compliance score and recommendations
    """
    try:
        image_data = await image.read()
        result = analyze_shelf_compliance(image_data, outlet_id)
        
        # Store in history
        analysis_history["shelf_compliance"].append(result.dict())
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/damage-detection", response_model=DamageDetectionResult)
async def detect_damage(
    product_id: Optional[str] = None,
    image: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    NEURAL: Detect product damage from image
    Returns damage level and action recommendations
    """
    try:
        image_data = await image.read()
        result = detect_product_damage(image_data, product_id)
        
        # Store in history
        analysis_history["damage_detection"].append(result.dict())
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.post("/analyze/counterfeit-check", response_model=CounterfeitCheckResult)
async def verify_authenticity(
    product_id: str,
    image: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    NEURAL: Verify product authenticity
    Checks for counterfeit indicators
    """
    try:
        image_data = await image.read()
        result = check_counterfeit(image_data, product_id)
        
        # Store in history
        analysis_history["counterfeit_check"].append(result.dict())
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/analyze/expiry-date", response_model=ExpiryDateResult)
async def read_expiry_date(
    product_id: Optional[str] = None,
    image: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    NEURAL: Extract expiry date using OCR
    BILINGUAL: Supports Arabic and English date formats
    """
    try:
        image_data = await image.read()
        result = extract_expiry_date(image_data, product_id)
        
        # Store in history
        analysis_history["expiry_date"].append(result.dict())
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@app.get("/history/shelf-compliance")
async def get_shelf_compliance_history(
    outlet_id: Optional[str] = None,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get shelf compliance analysis history"""
    history = analysis_history["shelf_compliance"]
    
    if outlet_id:
        history = [h for h in history if h["outlet_id"] == outlet_id]
    
    return {
        "total": len(history),
        "results": history[-limit:]
    }

@app.get("/history/damage-detection")
async def get_damage_detection_history(
    product_id: Optional[str] = None,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get damage detection history"""
    history = analysis_history["damage_detection"]
    
    if product_id:
        history = [h for h in history if h.get("product_id") == product_id]
    
    return {
        "total": len(history),
        "results": history[-limit:]
    }

@app.get("/analytics/compliance-trends")
async def get_compliance_trends(
    outlet_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Get compliance trends over time
    Provides analytics for decision-making
    """
    history = analysis_history["shelf_compliance"]
    
    if outlet_id:
        history = [h for h in history if h["outlet_id"] == outlet_id]
    
    if not history:
        return {"message": "No data available"}
    
    avg_score = sum(h["compliance_score"] for h in history) / len(history)
    avg_coverage = sum(h["shelf_coverage_percentage"] for h in history) / len(history)
    
    return {
        "total_analyses": len(history),
        "average_compliance_score": round(avg_score, 2),
        "average_shelf_coverage": round(avg_coverage, 2),
        "recent_trend": "improving" if len(history) > 1 and history[-1]["compliance_score"] > history[-2]["compliance_score"] else "stable"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Computer Vision Service",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
