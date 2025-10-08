-- Add Americana Foods Chilled Products to SSDP Database

-- Pound Cakes
INSERT INTO products (sku, name_ar, name_en, description_ar, description_en, category, brand, price, cost, requires_refrigeration, is_active, stock_quantity, min_stock_level) VALUES
('AMR-PC-VAN-290', 'كيك الفانيليا باوند', 'Vanilla Pound Cake', 'كيك الفانيليا الطازج 290 جرام', 'Fresh Vanilla Pound Cake 290g', 'حلويات مبردة', 'Americana', 12.50, 8.75, true, true, 100, 20),
('AMR-PC-CHO-290', 'كيك الشوكولاتة باوند', 'Chocolate Pound Cake', 'كيك الشوكولاتة الطازج 290 جرام', 'Fresh Chocolate Pound Cake 290g', 'حلويات مبردة', 'Americana', 12.50, 8.75, true, true, 100, 20),
('AMR-PC-CHOC-290', 'كيك باوند برقائق الشوكولاتة', 'Chocolate Chips Pound Cake', 'كيك باوند برقائق الشوكولاتة 290 جرام', 'Chocolate Chips Pound Cake 290g', 'حلويات مبردة', 'Americana', 13.00, 9.10, true, true, 100, 20),
('AMR-PC-DCHOC-290', 'كيك باوند برقائق الشوكولاتة المزدوجة', 'Double Chocolate Chips Pound Cake', 'كيك باوند برقائق الشوكولاتة المزدوجة 290 جرام', 'Double Chocolate Chips Pound Cake 290g', 'حلويات مبردة', 'Americana', 13.50, 9.45, true, true, 100, 20),
('AMR-PC-ORA-290', 'كيك البرتقال باوند', 'Orange Pound Cake', 'كيك البرتقال الطازج 290 جرام', 'Fresh Orange Pound Cake 290g', 'حلويات مبردة', 'Americana', 12.50, 8.75, true, true, 100, 20),
('AMR-PC-MAR-290', 'كيك الرخام باوند', 'Marble Pound Cake', 'كيك الرخام الطازج 290 جرام', 'Fresh Marble Pound Cake 290g', 'حلويات مبردة', 'Americana', 12.50, 8.75, true, true, 100, 20),
('AMR-PC-ALM-290', 'كيك اللوز والهيل باوند', 'Almond Cardamon Pound Cake', 'كيك اللوز والهيل الطازج 290 جرام', 'Fresh Almond Cardamon Pound Cake 290g', 'حلويات مبردة', 'Americana', 14.00, 9.80, true, true, 100, 20),

-- Swiss Rolls - Individual
('AMR-SR-VAN-20', 'سويس رول الفانيليا', 'Vanilla Swiss Roll', 'سويس رول الفانيليا بالكريمة 20 جرام', 'Vanilla Swiss Roll with Vanilla Cream 20g', 'حلويات مبردة', 'Americana', 2.50, 1.75, true, true, 200, 50),
('AMR-SR-VANSTR-20', 'سويس رول الفانيليا بمربى الفراولة', 'Vanilla Swiss Roll with Strawberry Jam', 'سويس رول الفانيليا بمربى الفراولة والكريمة 20 جرام', 'Vanilla Swiss Roll with Strawberry Jam & Vanilla Cream 20g', 'حلويات مبردة', 'Americana', 2.75, 1.93, true, true, 200, 50),
('AMR-SR-CHO-20', 'سويس رول الشوكولاتة', 'Chocolate Swiss Roll', 'سويس رول الشوكولاتة بالكريمة 20 جرام', 'Chocolate Swiss Roll with Vanilla Cream 20g', 'حلويات مبردة', 'Americana', 2.75, 1.93, true, true, 200, 50),

-- Swiss Rolls - Multi-pack 24 pieces
('AMR-SR-VAN-24', 'سويس رول الفانيليا 24 قطعة', 'Vanilla Swiss Rolls 24pcs', 'سويس رول الفانيليا بالكريمة 20 جرام × 24', 'Vanilla Swiss Rolls with Vanilla Cream 20g×24', 'حلويات مبردة', 'Americana', 55.00, 38.50, true, true, 50, 10),
('AMR-SR-VANSTR-24', 'سويس رول الفانيليا بمربى الفراولة 24 قطعة', 'Vanilla Swiss Rolls with Strawberry Jam 24pcs', 'سويس رول الفانيليا بمربى الفراولة والكريمة 20 جرام × 24', 'Vanilla Swiss Rolls with Strawberry Jam & Vanilla Cream 20g×24', 'حلويات مبردة', 'Americana', 60.00, 42.00, true, true, 50, 10),
('AMR-SR-CHO-24', 'سويس رول الشوكولاتة 24 قطعة', 'Chocolate Swiss Rolls 24pcs', 'سويس رول الشوكولاتة بالكريمة 20 جرام × 24', 'Chocolate Swiss Rolls with Vanilla Cream 20g×24', 'حلويات مبردة', 'Americana', 60.00, 42.00, true, true, 50, 10),

-- Super Swiss Rolls - Individual 60g
('AMR-SSR-VAN-60', 'سوبر سويس رول الفانيليا', 'Super Swiss Roll Vanilla', 'سوبر سويس رول الفانيليا بالكريمة 60 جرام', 'Super Swiss Roll Vanilla with Vanilla Cream 60g', 'حلويات مبردة', 'Americana', 5.50, 3.85, true, true, 150, 30),
('AMR-SSR-VANSTR-60', 'سوبر سويس رول الفانيليا بمربى الفراولة', 'Super Swiss Roll with Strawberry Jam', 'سوبر سويس رول الفانيليا بمربى الفراولة والكريمة 60 جرام', 'Super Swiss Roll with Strawberry Jam & Vanilla Cream 60g', 'حلويات مبردة', 'Americana', 6.00, 4.20, true, true, 150, 30),
('AMR-SSR-VANORA-60', 'سوبر سويس رول الفانيليا بمربى البرتقال', 'Super Swiss Roll with Orange Jam', 'سوبر سويس رول الفانيليا بمربى البرتقال والكريمة 60 جرام', 'Super Swiss Roll with Orange Jam & Vanilla Cream 60g', 'حلويات مبردة', 'Americana', 6.00, 4.20, true, true, 150, 30),
('AMR-SSR-CHO-60', 'سوبر سويس رول الشوكولاتة', 'Super Swiss Roll Chocolate', 'سوبر سويس رول الشوكولاتة بالكريمة 60 جرام', 'Super Swiss Roll Chocolate with Vanilla Cream 60g', 'حلويات مبردة', 'Americana', 6.00, 4.20, true, true, 150, 30),

-- Super Swiss Rolls - 6 pack
('AMR-SSR-VAN-6', 'سوبر سويس رول الفانيليا 6 قطع', 'Super Swiss Rolls Vanilla 6pcs', 'سوبر سويس رول الفانيليا بالكريمة 60 جرام × 6', 'Super Swiss Rolls Vanilla with Vanilla Cream 60g×6', 'حلويات مبردة', 'Americana', 30.00, 21.00, true, true, 75, 15),
('AMR-SSR-VANSTR-6', 'سوبر سويس رول الفانيليا بمربى الفراولة 6 قطع', 'Super Swiss Rolls with Strawberry Jam 6pcs', 'سوبر سويس رول الفانيليا بمربى الفراولة والكريمة 60 جرام × 6', 'Super Swiss Rolls with Strawberry Jam & Vanilla Cream 60g×6', 'حلويات مبردة', 'Americana', 33.00, 23.10, true, true, 75, 15),
('AMR-SSR-VANORA-6', 'سوبر سويس رول الفانيليا بمربى البرتقال 6 قطع', 'Super Swiss Rolls with Orange Jam 6pcs', 'سوبر سويس رول الفانيليا بمربى البرتقال والكريمة 60 جرام × 6', 'Super Swiss Rolls with Orange Jam & Vanilla Cream 60g×6', 'حلويات مبردة', 'Americana', 33.00, 23.10, true, true, 75, 15),
('AMR-SSR-CHO-6', 'سوبر سويس رول الشوكولاتة 6 قطع', 'Super Swiss Rolls Chocolate 6pcs', 'سوبر سويس رول الشوكولاتة بالكريمة 60 جرام × 6', 'Super Swiss Rolls Chocolate with Vanilla Cream 60g×6', 'حلويات مبردة', 'Americana', 33.00, 23.10, true, true, 75, 15),

-- 3 pieces Swiss Rolls
('AMR-SR3-VAN-75', 'سويس رول الفانيليا 3 قطع', '3 pcs Vanilla Swiss Rolls', 'سويس رول الفانيليا بالكريمة 75 جرام', '3 pcs Vanilla Swiss Rolls with Vanilla Cream 75g', 'حلويات مبردة', 'Americana', 7.50, 5.25, true, true, 100, 20),
('AMR-SR3-VANSTR-75', 'سويس رول الفانيليا بمربى الفراولة 3 قطع', '3 pcs Vanilla Swiss Rolls with Strawberry Jam', 'سويس رول الفانيليا بمربى الفراولة والكريمة 75 جرام', '3 pcs Vanilla Swiss Rolls with Strawberry Jam & Vanilla Cream 75g', 'حلويات مبردة', 'Americana', 8.00, 5.60, true, true, 100, 20),
('AMR-SR3-CHO-75', 'سويس رول الشوكولاتة 3 قطع', '3 pcs Chocolate Swiss Rolls', 'سويس رول الشوكولاتة بالكريمة 75 جرام', '3 pcs Chocolate Swiss Rolls with Vanilla Cream 75g', 'حلويات مبردة', 'Americana', 8.00, 5.60, true, true, 100, 20),

-- 6 pieces Swiss Rolls
('AMR-SR6-VAN-150', 'سويس رول الفانيليا 6 قطع', '6 pcs Vanilla Swiss Rolls', 'سويس رول الفانيليا بالكريمة 150 جرام', '6 pcs Vanilla Swiss Rolls with Vanilla Cream 150g', 'حلويات مبردة', 'Americana', 14.00, 9.80, true, true, 100, 20),
('AMR-SR6-VANSTR-150', 'سويس رول الفانيليا بمربى الفراولة 6 قطع', '6 pcs Vanilla Swiss Rolls with Strawberry Jam', 'سويس رول الفانيليا بمربى الفراولة والكريمة 150 جرام', '6 pcs Vanilla Swiss Rolls with Strawberry Jam & Vanilla Cream 150g', 'حلويات مبردة', 'Americana', 15.00, 10.50, true, true, 100, 20),
('AMR-SR6-CHO-150', 'سويس رول الشوكولاتة 6 قطع', '6 pcs Chocolate Swiss Rolls', 'سويس رول الشوكولاتة بالكريمة 150 جرام', '6 pcs Chocolate Swiss Rolls with Vanilla Cream 150g', 'حلويات مبردة', 'Americana', 15.00, 10.50, true, true, 100, 20),
('AMR-SR6-ORA-150', 'سويس رول البرتقال 6 قطع', '6 pcs Orange Swiss Rolls', 'سويس رول البرتقال بالكريمة 150 جرام', '6 pcs Orange Swiss Rolls with Vanilla Cream 150g', 'حلويات مبردة', 'Americana', 15.00, 10.50, true, true, 100, 20),

-- Small Swiss Rolls
('AMR-SRS-VAN-55', 'سويس رول الفانيليا الصغير', 'Small Vanilla Swiss Roll', 'سويس رول الفانيليا الصغير بالكريمة 55 جرام', 'Small Vanilla Swiss Roll with Vanilla Cream 55g', 'حلويات مبردة', 'Americana', 4.50, 3.15, true, true, 150, 30),
('AMR-SRS-VANSTR-55', 'سويس رول الفانيليا الصغير بالفراولة', 'Small Vanilla Swiss Roll with Strawberry', 'سويس رول الفانيليا الصغير بمربى الفراولة والكريمة', 'Small Vanilla Swiss Roll with Strawberry Jam & Vanilla Cream', 'حلويات مبردة', 'Americana', 5.00, 3.50, true, true, 150, 30),
('AMR-SRS-CHO-55', 'سويس رول الشوكولاتة الصغير', 'Small Chocolate Swiss Roll', 'سويس رول الشوكولاتة الصغير بالكريمة 55 جرام', 'Small Chocolate Swiss Roll with Vanilla Cream 55g', 'حلويات مبردة', 'Americana', 5.00, 3.50, true, true, 150, 30),

-- Large Swiss Rolls
('AMR-SRL-VAN-110', 'سويس رول الفانيليا الكبير', 'Large Vanilla Swiss Roll', 'سويس رول الفانيليا الكبير بالكريمة 110 جرام', 'Large Vanilla Swiss Roll with Vanilla Cream 110g', 'حلويات مبردة', 'Americana', 8.50, 5.95, true, true, 100, 20),
('AMR-SRL-VANSTR-110', 'سويس رول الفانيليا الكبير بالفراولة', 'Large Vanilla Swiss Roll with Strawberry', 'سويس رول الفانيليا الكبير بمربى الفراولة والكريمة 110 جرام', 'Large Vanilla Swiss Roll with Strawberry Jam & Vanilla Cream 110g', 'حلويات مبردة', 'Americana', 9.00, 6.30, true, true, 100, 20),
('AMR-SRL-CHO-110', 'سويس رول الشوكولاتة الكبير', 'Large Chocolate Swiss Roll', 'سويس رول الشوكولاتة الكبير بالكريمة 110 جرام', 'Large Chocolate Swiss Roll with Vanilla Cream 110g', 'حلويات مبردة', 'Americana', 9.00, 6.30, true, true, 100, 20);
