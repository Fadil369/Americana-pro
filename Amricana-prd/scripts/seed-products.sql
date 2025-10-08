-- SSDP Product Seeding Script
-- Americana Foods Refrigerated Sweets Integration

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    category VARCHAR(100) NOT NULL,
    category_en VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Americana refrigerated sweets
INSERT INTO products (sku, name_ar, name_en, description_ar, description_en, category, category_en, brand, price, cost, requires_refrigeration, stock_quantity) VALUES
('AMR-KUN-001', 'كنافة بالجبن الطازجة', 'Fresh Cheese Kunafa', 'كنافة طازجة محشوة بالجبن الطبيعي', 'Fresh kunafa filled with natural cheese', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 25.50, 18.00, TRUE, 50),
('AMR-MUH-001', 'مهلبية بالفستق', 'Pistachio Muhallabia', 'مهلبية كريمية مزينة بالفستق الحلبي', 'Creamy muhallabia topped with Aleppo pistachios', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 18.75, 12.50, TRUE, 75),
('AMR-OMA-001', 'أم علي بالمكسرات', 'Om Ali with Mixed Nuts', 'أم علي تقليدية بالحليب والمكسرات المشكلة', 'Traditional Om Ali with milk and mixed nuts', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 22.00, 15.00, TRUE, 60),
('AMR-CHE-001', 'تشيز كيك بالتوت', 'Berry Cheesecake', 'تشيز كيك كريمي بطبقة التوت الطازج', 'Creamy cheesecake with fresh berry topping', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 35.00, 25.00, TRUE, 30),
('AMR-TIR-001', 'تيراميسو كلاسيك', 'Classic Tiramisu', 'تيراميسو إيطالي أصيل بالقهوة والماسكاربوني', 'Authentic Italian tiramisu with coffee and mascarpone', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 28.50, 20.00, TRUE, 40);

-- Add additional traditional Saudi sweets
INSERT INTO products (sku, name_ar, name_en, description_ar, description_en, category, category_en, brand, price, cost, requires_refrigeration, stock_quantity) VALUES
('SAU-BAK-001', 'بقلاوة بالفستق', 'Pistachio Baklava', 'بقلاوة مقرمشة محشوة بالفستق الحلبي', 'Crispy baklava filled with Aleppo pistachios', 'حلويات تقليدية', 'Traditional Sweets', 'SSDP', 32.00, 22.00, FALSE, 100),
('SAU-MAA-001', 'معمول بالتمر', 'Date Maamoul', 'معمول طازج محشو بالتمر الطبيعي', 'Fresh maamoul filled with natural dates', 'حلويات تقليدية', 'Traditional Sweets', 'SSDP', 28.00, 18.00, FALSE, 120),
('SAU-QAT-001', 'قطايف بالقشطة', 'Qatayef with Cream', 'قطايف رمضانية محشوة بالقشطة', 'Ramadan qatayef filled with cream', 'حلويات موسمية', 'Seasonal Sweets', 'SSDP', 24.00, 16.00, TRUE, 80),
('SAU-HAL-001', 'حلاوة الجبن', 'Cheese Halawa', 'حلاوة الجبن الدمشقية الأصيلة', 'Authentic Damascus cheese halawa', 'حلويات شامية', 'Levantine Sweets', 'SSDP', 26.50, 18.50, TRUE, 65),
('SAU-BAS-001', 'بسبوسة بجوز الهند', 'Coconut Basbousa', 'بسبوسة طرية بجوز الهند والقطر', 'Soft basbousa with coconut and syrup', 'حلويات تقليدية', 'Traditional Sweets', 'SSDP', 20.00, 13.00, FALSE, 90);

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert categories
INSERT INTO product_categories (name_ar, name_en, description_ar, description_en) VALUES
('حلويات مبردة', 'Refrigerated Sweets', 'حلويات تحتاج للحفظ في الثلاجة', 'Sweets that require refrigeration'),
('حلويات تقليدية', 'Traditional Sweets', 'الحلويات السعودية والعربية التقليدية', 'Traditional Saudi and Arabic sweets'),
('حلويات موسمية', 'Seasonal Sweets', 'حلويات خاصة بالمواسم والمناسبات', 'Special seasonal and occasion sweets'),
('حلويات شامية', 'Levantine Sweets', 'الحلويات الشامية الأصيلة', 'Authentic Levantine sweets');

-- Update product table to reference categories
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES product_categories(id);

-- Update existing products with category IDs
UPDATE products SET category_id = (SELECT id FROM product_categories WHERE name_ar = products.category);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_refrigeration ON products(requires_refrigeration);
