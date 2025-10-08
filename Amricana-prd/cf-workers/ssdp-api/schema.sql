-- SSDP Database Schema for Cloudflare D1
-- Smart Sweet Distribution Platform

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    category TEXT NOT NULL,
    category_en TEXT,
    brand TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0.00,
    cost REAL NOT NULL DEFAULT 0.00,
    image_url TEXT,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Outlets table
CREATE TABLE IF NOT EXISTS outlets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cr_number TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    district TEXT,
    city TEXT NOT NULL,
    region TEXT,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    credit_limit REAL DEFAULT 0.00,
    current_balance REAL DEFAULT 0.00,
    status TEXT DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    outlet_id INTEGER NOT NULL,
    sales_rep_id INTEGER,
    driver_id INTEGER,
    status TEXT DEFAULT 'pending',
    total_amount REAL NOT NULL DEFAULT 0.00,
    vat_amount REAL NOT NULL DEFAULT 0.00,
    discount_amount REAL DEFAULT 0.00,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    delivery_date DATE,
    delivery_time TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outlet_id) REFERENCES outlets (id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Users table (sales reps, drivers, managers)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    role TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT UNIQUE NOT NULL,
    driver_id INTEGER,
    capacity REAL NOT NULL,
    current_latitude REAL,
    current_longitude REAL,
    status TEXT DEFAULT 'available',
    last_maintenance DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users (id)
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    status TEXT DEFAULT 'assigned',
    scheduled_date DATE,
    delivered_at DATETIME,
    proof_of_delivery TEXT, -- JSON with photos, signatures, etc.
    delivery_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
    FOREIGN KEY (driver_id) REFERENCES users (id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    outlet_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    status TEXT DEFAULT 'pending',
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (outlet_id) REFERENCES outlets (id)
);

-- Invoices table (ZATCA compliance)
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    order_id INTEGER NOT NULL,
    outlet_id INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal REAL NOT NULL,
    vat_amount REAL NOT NULL,
    total_amount REAL NOT NULL,
    zatca_qr_code TEXT,
    zatca_xml TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (outlet_id) REFERENCES outlets (id)
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id INTEGER,
    outlet_id INTEGER,
    product_id INTEGER,
    event_data TEXT, -- JSON
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (outlet_id) REFERENCES outlets (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_outlets_cr_number ON outlets(cr_number);
CREATE INDEX IF NOT EXISTS idx_outlets_city ON outlets(city);
CREATE INDEX IF NOT EXISTS idx_outlets_status ON outlets(status);

CREATE INDEX IF NOT EXISTS idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON deliveries(driver_id);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_outlet_id ON payments(outlet_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_outlet_id ON invoices(outlet_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Insert sample data
INSERT OR IGNORE INTO products (sku, name_ar, name_en, description_ar, description_en, category, category_en, brand, price, cost, requires_refrigeration, stock_quantity) VALUES
('AMR-KUN-001', 'كنافة بالجبن الطازجة', 'Fresh Cheese Kunafa', 'كنافة طازجة محشوة بالجبن الطبيعي', 'Fresh kunafa filled with natural cheese', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 25.50, 18.00, TRUE, 50),
('AMR-MUH-001', 'مهلبية بالفستق', 'Pistachio Muhallabia', 'مهلبية كريمية مزينة بالفستق الحلبي', 'Creamy muhallabia topped with Aleppo pistachios', 'حلويات مبردة', 'Refrigerated Sweets', 'Americana', 18.75, 12.50, TRUE, 75),
('SAU-BAK-001', 'بقلاوة بالفستق', 'Pistachio Baklava', 'بقلاوة مقرمشة محشوة بالفستق الحلبي', 'Crispy baklava filled with Aleppo pistachios', 'حلويات تقليدية', 'Traditional Sweets', 'SSDP', 32.00, 22.00, FALSE, 100),
('SAU-MAA-001', 'معمول بالتمر', 'Date Maamoul', 'معمول طازج محشو بالتمر الطبيعي', 'Fresh maamoul filled with natural dates', 'حلويات تقليدية', 'Traditional Sweets', 'SSDP', 28.00, 18.00, FALSE, 120);

INSERT OR IGNORE INTO users (username, email, password_hash, name_ar, name_en, role, phone) VALUES
('admin', 'admin@ssdp.com', '$2b$10$hash', 'المدير العام', 'System Admin', 'admin', '+966501234567'),
('sales_rep_1', 'ahmed@ssdp.com', '$2b$10$hash', 'أحمد محمد', 'Ahmed Mohammed', 'sales_rep', '+966501234568'),
('driver_1', 'khalid@ssdp.com', '$2b$10$hash', 'خالد علي', 'Khalid Ali', 'driver', '+966501234569');
