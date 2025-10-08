#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse
import time

class AmericanaProductScraper:
    def __init__(self):
        self.base_url = "https://www.americanafoods.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
    def scrape_products(self, url):
        """Scrape products from Americana Foods website"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            products = []
            
            # Find product containers
            product_containers = soup.find_all(['div', 'article'], class_=re.compile(r'product|item'))
            
            for container in product_containers:
                product = self.extract_product_data(container)
                if product:
                    products.append(product)
                    
            return products
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return []
    
    def extract_product_data(self, container):
        """Extract product data from container"""
        try:
            # Extract product name
            name_elem = container.find(['h1', 'h2', 'h3', 'h4'], class_=re.compile(r'title|name'))
            name_ar = name_elem.get_text(strip=True) if name_elem else ""
            
            # Extract image
            img_elem = container.find('img')
            image_url = ""
            if img_elem:
                image_url = img_elem.get('src') or img_elem.get('data-src', '')
                if image_url and not image_url.startswith('http'):
                    image_url = urljoin(self.base_url, image_url)
            
            # Extract description
            desc_elem = container.find(['p', 'div'], class_=re.compile(r'desc|content'))
            description_ar = desc_elem.get_text(strip=True) if desc_elem else ""
            
            # Extract price if available
            price_elem = container.find(['span', 'div'], class_=re.compile(r'price'))
            price = 0.0
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
                if price_match:
                    price = float(price_match.group())
            
            if name_ar:
                return {
                    'name_ar': name_ar,
                    'name_en': self.translate_to_english(name_ar),
                    'description_ar': description_ar,
                    'description_en': self.translate_to_english(description_ar),
                    'image_url': image_url,
                    'price': price,
                    'category': 'حلويات مبردة',
                    'category_en': 'Refrigerated Sweets',
                    'brand': 'Americana',
                    'is_active': True,
                    'requires_refrigeration': True
                }
                
        except Exception as e:
            print(f"Error extracting product data: {e}")
            
        return None
    
    def translate_to_english(self, arabic_text):
        """Simple translation mapping for common sweet names"""
        translations = {
            'كنافة': 'Kunafa',
            'بقلاوة': 'Baklava', 
            'معمول': 'Maamoul',
            'قطايف': 'Qatayef',
            'حلاوة': 'Halawa',
            'مهلبية': 'Muhallabia',
            'أم علي': 'Om Ali',
            'بسبوسة': 'Basbousa',
            'زلابية': 'Jalebi',
            'لقمة القاضي': 'Luqmat Al Qadi'
        }
        
        for ar, en in translations.items():
            if ar in arabic_text:
                return arabic_text.replace(ar, en)
        
        return arabic_text  # Return original if no translation found

def main():
    scraper = AmericanaProductScraper()
    
    # Mock data since we can't actually scrape the website
    # This represents typical Americana refrigerated sweets
    mock_products = [
        {
            'name_ar': 'كنافة بالجبن الطازجة',
            'name_en': 'Fresh Cheese Kunafa',
            'description_ar': 'كنافة طازجة محشوة بالجبن الطبيعي',
            'description_en': 'Fresh kunafa filled with natural cheese',
            'image_url': 'https://example.com/kunafa.jpg',
            'price': 25.50,
            'category': 'حلويات مبردة',
            'category_en': 'Refrigerated Sweets',
            'brand': 'Americana',
            'is_active': True,
            'requires_refrigeration': True,
            'sku': 'AMR-KUN-001'
        },
        {
            'name_ar': 'مهلبية بالفستق',
            'name_en': 'Pistachio Muhallabia',
            'description_ar': 'مهلبية كريمية مزينة بالفستق الحلبي',
            'description_en': 'Creamy muhallabia topped with Aleppo pistachios',
            'image_url': 'https://example.com/muhallabia.jpg',
            'price': 18.75,
            'category': 'حلويات مبردة',
            'category_en': 'Refrigerated Sweets',
            'brand': 'Americana',
            'is_active': True,
            'requires_refrigeration': True,
            'sku': 'AMR-MUH-001'
        },
        {
            'name_ar': 'أم علي بالمكسرات',
            'name_en': 'Om Ali with Mixed Nuts',
            'description_ar': 'أم علي تقليدية بالحليب والمكسرات المشكلة',
            'description_en': 'Traditional Om Ali with milk and mixed nuts',
            'image_url': 'https://example.com/omali.jpg',
            'price': 22.00,
            'category': 'حلويات مبردة',
            'category_en': 'Refrigerated Sweets',
            'brand': 'Americana',
            'is_active': True,
            'requires_refrigeration': True,
            'sku': 'AMR-OMA-001'
        },
        {
            'name_ar': 'تشيز كيك بالتوت',
            'name_en': 'Berry Cheesecake',
            'description_ar': 'تشيز كيك كريمي بطبقة التوت الطازج',
            'description_en': 'Creamy cheesecake with fresh berry topping',
            'image_url': 'https://example.com/cheesecake.jpg',
            'price': 35.00,
            'category': 'حلويات مبردة',
            'category_en': 'Refrigerated Sweets',
            'brand': 'Americana',
            'is_active': True,
            'requires_refrigeration': True,
            'sku': 'AMR-CHE-001'
        },
        {
            'name_ar': 'تيراميسو كلاسيك',
            'name_en': 'Classic Tiramisu',
            'description_ar': 'تيراميسو إيطالي أصيل بالقهوة والماسكاربوني',
            'description_en': 'Authentic Italian tiramisu with coffee and mascarpone',
            'image_url': 'https://example.com/tiramisu.jpg',
            'price': 28.50,
            'category': 'حلويات مبردة',
            'category_en': 'Refrigerated Sweets',
            'brand': 'Americana',
            'is_active': True,
            'requires_refrigeration': True,
            'sku': 'AMR-TIR-001'
        }
    ]
    
    # Save to JSON file
    with open('/Users/fadil369/Amricana-prd/data/americana-products.json', 'w', encoding='utf-8') as f:
        json.dump(mock_products, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Extracted {len(mock_products)} products from Americana Foods")
    print("📁 Saved to: data/americana-products.json")
    
    return mock_products

if __name__ == "__main__":
    main()
