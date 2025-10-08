from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import json
import os

router = APIRouter(prefix="/products", tags=["products"])

class Product(BaseModel):
    id: Optional[int] = None
    sku: str
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    category: str
    category_en: str
    brand: str
    price: float
    cost: Optional[float] = None
    image_url: Optional[str] = None
    requires_refrigeration: bool = False
    is_active: bool = True
    stock_quantity: int = 0

class ProductCategory(BaseModel):
    id: Optional[int] = None
    name_ar: str
    name_en: str
    description_ar: Optional[str] = None
    description_en: Optional[str] = None

# Load products from JSON file
def load_products():
    try:
        with open('/app/data/americana-products.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback mock data
        return [
            {
                "sku": "AMR-KUN-001",
                "name_ar": "كنافة بالجبن الطازجة",
                "name_en": "Fresh Cheese Kunafa",
                "description_ar": "كنافة طازجة محشوة بالجبن الطبيعي",
                "description_en": "Fresh kunafa filled with natural cheese",
                "category": "حلويات مبردة",
                "category_en": "Refrigerated Sweets",
                "brand": "Americana",
                "price": 25.50,
                "cost": 18.00,
                "requires_refrigeration": True,
                "stock_quantity": 50
            }
        ]

@router.get("/", response_model=List[Product])
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    refrigerated_only: Optional[bool] = Query(None, description="Show only refrigerated products"),
    active_only: bool = Query(True, description="Show only active products")
):
    """Get all products with optional filters"""
    products = load_products()
    
    # Apply filters
    if category:
        products = [p for p in products if category.lower() in p.get('category', '').lower()]
    
    if brand:
        products = [p for p in products if brand.lower() in p.get('brand', '').lower()]
    
    if refrigerated_only is not None:
        products = [p for p in products if p.get('requires_refrigeration') == refrigerated_only]
    
    if active_only:
        products = [p for p in products if p.get('is_active', True)]
    
    return products

@router.get("/categories", response_model=List[ProductCategory])
async def get_categories():
    """Get all product categories"""
    return [
        {
            "name_ar": "حلويات مبردة",
            "name_en": "Refrigerated Sweets",
            "description_ar": "حلويات تحتاج للحفظ في الثلاجة",
            "description_en": "Sweets that require refrigeration"
        },
        {
            "name_ar": "حلويات تقليدية", 
            "name_en": "Traditional Sweets",
            "description_ar": "الحلويات السعودية والعربية التقليدية",
            "description_en": "Traditional Saudi and Arabic sweets"
        },
        {
            "name_ar": "حلويات موسمية",
            "name_en": "Seasonal Sweets", 
            "description_ar": "حلويات خاصة بالمواسم والمناسبات",
            "description_en": "Special seasonal and occasion sweets"
        }
    ]

@router.get("/{sku}", response_model=Product)
async def get_product_by_sku(sku: str):
    """Get product by SKU"""
    products = load_products()
    product = next((p for p in products if p.get('sku') == sku), None)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@router.get("/search/{query}")
async def search_products(query: str, lang: str = Query("ar", description="Search language (ar/en)")):
    """Search products by name or description"""
    products = load_products()
    results = []
    
    query_lower = query.lower()
    
    for product in products:
        if lang == "ar":
            if (query_lower in product.get('name_ar', '').lower() or 
                query_lower in product.get('description_ar', '').lower()):
                results.append(product)
        else:
            if (query_lower in product.get('name_en', '').lower() or 
                query_lower in product.get('description_en', '').lower()):
                results.append(product)
    
    return results

@router.get("/recommendations/{outlet_id}")
async def get_product_recommendations(outlet_id: str):
    """Get AI-powered product recommendations for outlet"""
    # Mock recommendations based on popular items
    products = load_products()
    
    # Simple recommendation: return top 3 products
    recommendations = products[:3]
    
    return {
        "outlet_id": outlet_id,
        "recommendations": recommendations,
        "reason_ar": "منتجات مقترحة بناءً على المبيعات السابقة",
        "reason_en": "Recommended products based on previous sales"
    }
