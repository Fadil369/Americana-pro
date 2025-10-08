// SSDP Enhanced Platform - Advanced JavaScript
// Saudi-themed smart sweet distribution platform

class SSDP_Enhanced {
    constructor() {
        this.apiBase = 'https://ssdp-api.dr-mf-12298.workers.dev/api';
        this.currentLang = 'ar';
        this.currentTheme = 'light';
        this.sidebarOpen = false;
        this.cache = new Map();
        this.charts = {};
        this.map = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.initializeAnimations();
            await this.loadInitialData();
            this.initializeCharts();
            this.initializeMap();
            this.startRealTimeUpdates();
            this.hideLoadingScreen();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.hideLoadingScreen();
            this.showNotification('حدث خطأ في تهيئة النظام', 'error');
        }
    }

    setupEventListeners() {
        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', this.debounce((e) => {
                this.performGlobalSearch(e.target.value);
            }, 300));
        }

        // Product search and filters
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', this.debounce((e) => {
                this.filterProducts(e.target.value);
            }, 300));
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterProducts(null, e.target.value);
            });
        }

        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchChartPeriod(e.target.textContent.trim());
                this.updateActiveButton(e.target, '.chart-btn');
            });
        });

        // Map filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterMapData(e.target.dataset.filter);
                this.updateActiveButton(e.target, '.filter-btn');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        globalSearch?.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.openProductModal();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleSidebar();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Window events
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        window.addEventListener('online', () => {
            this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
            this.loadInitialData();
        });

        window.addEventListener('offline', () => {
            this.showNotification('لا يوجد اتصال بالإنترنت', 'warning');
        });
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.stat-card, .chart-container, .map-container').forEach(el => {
            observer.observe(el);
        });

        // Counter animations
        this.animateCounters();
    }

    async loadInitialData() {
        try {
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const [dashboardData, productsData] = await Promise.all([
                Promise.race([this.apiCall('/analytics/dashboard'), timeout])
                    .catch(() => ({ success: false, data: this.getFallbackDashboardData() })),
                Promise.race([this.apiCall('/products'), timeout])
                    .catch(() => ({ success: false, products: [] }))
            ]);

            if (dashboardData.success || dashboardData.data) {
                this.updateDashboardStats(dashboardData.data || dashboardData);
            } else {
                this.updateDashboardStats(this.getFallbackDashboardData());
            }

            if (productsData.success) {
                this.renderProducts(productsData.products || []);
            }

            this.updateQuickStats();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.updateDashboardStats(this.getFallbackDashboardData());
        }
    }

    getFallbackDashboardData() {
        return {
            total_sales_today: 125430.50,
            active_vehicles: 24,
            active_customers: 1234,
            completed_orders: 89,
            sales_trend: [
                { date: '2024-01-01', amount: 45000 },
                { date: '2024-01-02', amount: 52000 },
                { date: '2024-01-03', amount: 48000 },
                { date: '2024-01-04', amount: 55000 },
                { date: '2024-01-05', amount: 62000 }
            ],
            top_products: [
                { name: 'كنافة بالجبن', sales: 150 },
                { name: 'بقلاوة بالفستق', sales: 120 },
                { name: 'مهلبية', sales: 95 }
            ]
        };
    }

    updateDashboardStats(data) {
        const stats = {
            'total-sales': this.formatCurrency(data.total_sales_today || 0),
            'active-vehicles': this.formatNumber(data.active_vehicles || 0),
            'active-customers': this.formatNumber(data.active_customers || 0),
            'completed-orders': this.formatNumber(data.completed_orders || 0)
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateCounter(element, value);
            }
        });

        // Update chart data
        if (data.sales_trend) {
            this.updateSalesChart(data.sales_trend);
        }

        // Update activity feed
        if (data.top_products) {
            this.updateActivityFeed(data.top_products);
        }
    }

    updateQuickStats() {
        const quickStats = {
            'quick-outlets': '1,234',
            'quick-orders': '89',
            'quick-vehicles': '24'
        };

        Object.entries(quickStats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateCounter(element, value);
            }
        });
    }

    initializeCharts() {
        const salesChartCanvas = document.getElementById('sales-chart');
        if (salesChartCanvas && typeof Chart !== 'undefined') {
            const ctx = salesChartCanvas.getContext('2d');
            
            this.charts.sales = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                    datasets: [{
                        label: 'المبيعات',
                        data: [45000, 52000, 48000, 55000, 62000],
                        borderColor: '#ea580c',
                        backgroundColor: 'rgba(234, 88, 12, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ea580c',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return (value / 1000) + 'K';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    }

    initializeMap() {
        const mapContainer = document.getElementById('operations-map');
        if (mapContainer && typeof L !== 'undefined') {
            // Riyadh coordinates
            const riyadhCoords = [24.7136, 46.6753];
            
            this.map = L.map('operations-map').setView(riyadhCoords, 11);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // Add sample markers
            this.addMapMarkers();
            
            // Add Saudi flag marker at center
            const saudiIcon = L.divIcon({
                html: '<div style="font-size: 24px;">🇸🇦</div>',
                iconSize: [30, 30],
                className: 'saudi-marker'
            });
            
            L.marker(riyadhCoords, { icon: saudiIcon })
                .addTo(this.map)
                .bindPopup('<b>الرياض</b><br>المملكة العربية السعودية');
        }
    }

    addMapMarkers() {
        if (!this.map) return;

        const markers = [
            { pos: [24.7236, 46.6853], type: 'vehicle', name: 'مركبة 1' },
            { pos: [24.7036, 46.6653], type: 'outlet', name: 'منفذ الملز' },
            { pos: [24.7336, 46.6953], type: 'delivery', name: 'توصيل 1' },
            { pos: [24.6936, 46.6553], type: 'outlet', name: 'منفذ العليا' },
            { pos: [24.7436, 46.7053], type: 'vehicle', name: 'مركبة 2' }
        ];

        markers.forEach(marker => {
            const icon = this.getMarkerIcon(marker.type);
            L.marker(marker.pos, { icon })
                .addTo(this.map)
                .bindPopup(`<b>${marker.name}</b><br>النوع: ${marker.type}`);
        });
    }

    getMarkerIcon(type) {
        const icons = {
            vehicle: '🚛',
            outlet: '🏪',
            delivery: '📦'
        };

        return L.divIcon({
            html: `<div style="font-size: 20px;">${icons[type] || '📍'}</div>`,
            iconSize: [25, 25],
            className: 'custom-marker'
        });
    }

    // API Methods
    async apiCall(endpoint, options = {}) {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
        if (options.method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': this.currentLang,
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (options.method === 'GET' || !options.method) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error('API Call failed:', error);
            throw error;
        }
    }

    // UI Methods
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const activeNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'products':
                await this.loadProducts();
                break;
            case 'outlets':
                await this.loadOutlets();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
        }
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (sidebar) {
            sidebar.classList.toggle('open', this.sidebarOpen);
        }
        
        if (mainContent) {
            mainContent.classList.toggle('sidebar-open', this.sidebarOpen);
        }

        // Animate hamburger
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.style.transform = this.sidebarOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('lang', this.currentLang);
        document.documentElement.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
        
        // Update UI text
        this.updateUILanguage();
        this.showNotification(
            this.currentLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
            'success'
        );
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const themeBtn = document.querySelector('[onclick="toggleTheme()"]');
        if (themeBtn) {
            themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
        
        this.showNotification(
            this.currentTheme === 'dark' ? 'تم تفعيل المظهر الداكن' : 'تم تفعيل المظهر الفاتح',
            'success'
        );
    }

    // Animation Methods
    animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (parseFloat(targetValue.toString().replace(/[^\d.-]/g, '')) - startValue) * this.easeOutQuart(progress));
            
            if (typeof targetValue === 'string' && targetValue.includes('ريال')) {
                element.textContent = this.formatCurrency(currentValue);
            } else {
                element.textContent = this.formatNumber(currentValue);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-value');
        counters.forEach(counter => {
            const targetValue = counter.textContent;
            counter.textContent = '0';
            setTimeout(() => {
                this.animateCounter(counter, targetValue);
            }, Math.random() * 1000);
        });
    }

    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ar-SA').format(num);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loader = document.getElementById('loading-screen');
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 2000);
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
    }

    updateRealTimeData() {
        // Simulate real-time updates
        const elements = ['quick-outlets', 'quick-orders', 'quick-vehicles'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const currentValue = parseInt(element.textContent.replace(/,/g, ''));
                const newValue = currentValue + Math.floor(Math.random() * 5) - 2;
                this.animateCounter(element, Math.max(0, newValue));
            }
        });
    }

    updateActiveButton(activeBtn, selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    handleResize() {
        if (this.map) {
            this.map.invalidateSize();
        }
        
        if (window.innerWidth < 1024 && this.sidebarOpen) {
            this.toggleSidebar();
        }
    }
}

// Global instance
let ssdp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ssdp = new SSDP_Enhanced();
});

// Global functions for HTML onclick handlers
window.showSection = (sectionId) => ssdp?.showSection(sectionId);
window.toggleSidebar = () => ssdp?.toggleSidebar();
window.toggleLanguage = () => ssdp?.toggleLanguage();
window.toggleTheme = () => ssdp?.toggleTheme();
window.openProductModal = () => ssdp?.openProductModal();
window.closeModal = (id) => ssdp?.closeModal(id);
