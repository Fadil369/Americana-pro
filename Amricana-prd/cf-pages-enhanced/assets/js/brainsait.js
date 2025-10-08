// BrainSAIT Brand & UX Build Specification - Enhanced JavaScript
// Official BrainSAIT Design System Implementation

class BrainSAIT_SSDP {
    constructor() {
        this.apiBase = 'https://ssdp-api.dr-mf-12298.workers.dev/api';
        this.currentLang = 'ar';
        this.currentTheme = 'light';
        this.cache = new Map();
        this.telemetryInterval = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.initializeBrainSAITAnimations();
            await this.loadKPIData();
            this.initializeMap();
            this.startTelemetryUpdates();
            this.showAlertBanner();
            this.hideLoadingScreen();
        } catch (error) {
            console.error('BrainSAIT initialization failed:', error);
            this.hideLoadingScreen();
            this.showAlert('حدث خطأ في تهيئة النظام', 'error');
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        document.getElementById('global-search')?.focus();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.toggleLanguage();
                        break;
                }
            }
        });

        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.updateFilterChips(e.target);
                this.filterMapData(e.target.dataset.filter);
            });
        });

        // Real-time updates
        window.addEventListener('online', () => {
            this.showAlert('تم استعادة الاتصال بالإنترنت', 'success');
            this.loadKPIData();
        });

        window.addEventListener('offline', () => {
            this.showAlert('لا يوجد اتصال بالإنترنت - وضع عدم الاتصال', 'warning');
        });
    }

    initializeBrainSAITAnimations() {
        // Intersection Observer for KPI cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    this.animateKPIValue(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.kpi-card').forEach(card => {
            observer.observe(card);
        });

        // Stagger animation for filter chips
        document.querySelectorAll('.filter-chip').forEach((chip, index) => {
            chip.style.animationDelay = `${index * 0.1}s`;
            chip.classList.add('slide-up');
        });
    }

    async loadKPIData() {
        try {
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 8000)
            );

            const response = await Promise.race([
                this.apiCall('/analytics/dashboard'),
                timeout
            ]).catch(() => ({ success: false, data: this.getFallbackKPIData() }));

            const data = response.success ? response.data : this.getFallbackKPIData();
            this.updateKPIValues(data);
            
        } catch (error) {
            console.error('Failed to load KPI data:', error);
            this.updateKPIValues(this.getFallbackKPIData());
        }
    }

    getFallbackKPIData() {
        return {
            total_sales_today: 125430.50,
            active_vehicles: 24,
            active_customers: 1234,
            completed_orders: 89
        };
    }

    updateKPIValues(data) {
        const kpiMappings = {
            'total-sales': { value: data.total_sales_today, format: 'currency' },
            'active-vehicles': { value: data.active_vehicles, format: 'number' },
            'active-customers': { value: data.active_customers, format: 'number' },
            'completed-orders': { value: data.completed_orders, format: 'number' }
        };

        Object.entries(kpiMappings).forEach(([id, config]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateKPICounter(element, config.value, config.format);
            }
        });
    }

    animateKPICounter(element, targetValue, format) {
        const startValue = 0;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * this.easeOutQuart(progress));
            
            if (format === 'currency') {
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

    animateKPIValue(card) {
        const value = card.querySelector('.kpi-value');
        const icon = card.querySelector('.kpi-icon');
        
        if (value) {
            value.style.animation = 'countUp 2s ease-out';
        }
        
        if (icon) {
            icon.style.animation = 'bounce 2s infinite';
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

            // Add BrainSAIT branded markers
            this.addBrainSAITMarkers();
            
            // Add telemetry overlay updates
            this.updateMapTelemetry();
        }
    }

    addBrainSAITMarkers() {
        if (!this.map) return;

        const markers = [
            { pos: [24.7236, 46.6853], type: 'vehicle', name: 'مركبة BrainSAIT 1', status: 'active' },
            { pos: [24.7036, 46.6653], type: 'outlet', name: 'منفذ الملز الذكي', status: 'online' },
            { pos: [24.7336, 46.6953], type: 'delivery', name: 'توصيل AI 1', status: 'enroute' },
            { pos: [24.6936, 46.6553], type: 'outlet', name: 'منفذ العليا الذكي', status: 'online' },
            { pos: [24.7436, 46.7053], type: 'vehicle', name: 'مركبة BrainSAIT 2', status: 'active' }
        ];

        markers.forEach(marker => {
            const icon = this.createBrainSAITMarkerIcon(marker.type, marker.status);
            L.marker(marker.pos, { icon })
                .addTo(this.map)
                .bindPopup(`
                    <div class="brainsait-popup">
                        <h4>${marker.name}</h4>
                        <p>الحالة: <span class="status-${marker.status}">${marker.status}</span></p>
                        <p>مدعوم بـ BrainSAIT AI</p>
                    </div>
                `);
        });

        // Add BrainSAIT HQ marker
        const brainsaitIcon = L.divIcon({
            html: '<div style="font-size: 24px; text-align: center;">🧠<br><small>BrainSAIT</small></div>',
            iconSize: [40, 40],
            className: 'brainsait-hq-marker'
        });
        
        L.marker([24.7136, 46.6753], { icon: brainsaitIcon })
            .addTo(this.map)
            .bindPopup('<b>BrainSAIT HQ</b><br>مقر الذكاء الاصطناعي للأعمال');
    }

    createBrainSAITMarkerIcon(type, status) {
        const icons = {
            vehicle: '🚛',
            outlet: '🏪',
            delivery: '📦'
        };

        const colors = {
            active: '#10b981',
            online: '#0ea5e9',
            enroute: '#f59e0b'
        };

        return L.divIcon({
            html: `
                <div style="
                    font-size: 20px; 
                    text-align: center; 
                    background: ${colors[status] || '#64748b'}; 
                    border-radius: 50%; 
                    width: 30px; 
                    height: 30px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                    ${icons[type] || '📍'}
                </div>
            `,
            iconSize: [30, 30],
            className: 'brainsait-marker'
        });
    }

    updateFilterChips(activeChip) {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        activeChip.classList.add('active');
    }

    filterMapData(filter) {
        // Simulate filtering map data
        console.log(`Filtering map data by: ${filter}`);
        this.updateMapTelemetry(filter);
    }

    updateMapTelemetry(filter = 'all') {
        const telemetryOverlay = document.querySelector('.map-content .telemetry-overlay');
        if (telemetryOverlay) {
            const timestamp = new Date().toLocaleTimeString('ar-SA');
            telemetryOverlay.textContent = `GPS: ACTIVE | FILTER: ${filter.toUpperCase()} | SYNC: ${timestamp}`;
        }
    }

    startTelemetryUpdates() {
        this.telemetryInterval = setInterval(() => {
            this.updateRealTimeData();
            this.updateMapTelemetry();
        }, 30000); // Update every 30 seconds
    }

    updateRealTimeData() {
        // Simulate real-time KPI updates
        const kpiElements = ['total-sales', 'active-vehicles', 'active-customers', 'completed-orders'];
        
        kpiElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const currentValue = parseInt(element.textContent.replace(/[^\d]/g, ''));
                const variation = Math.floor(Math.random() * 10) - 5; // ±5 variation
                const newValue = Math.max(0, currentValue + variation);
                
                if (id === 'total-sales') {
                    element.textContent = this.formatCurrency(newValue);
                } else {
                    element.textContent = this.formatNumber(newValue);
                }
            }
        });
    }

    showAlertBanner() {
        const banner = document.getElementById('alert-banner');
        if (banner) {
            banner.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                banner.classList.remove('show');
            }, 5000);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const themeBtn = document.querySelector('[onclick="toggleTheme()"]');
        if (themeBtn) {
            themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
        
        this.showAlert(
            this.currentTheme === 'dark' ? 'تم تفعيل المظهر الداكن' : 'تم تفعيل المظهر الفاتح',
            'success'
        );
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('lang', this.currentLang);
        document.documentElement.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
        
        this.showAlert(
            this.currentLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
            'success'
        );
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
                    'X-BrainSAIT-Client': 'SSDP-Enhanced',
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
            console.error('BrainSAIT API Call failed:', error);
            throw error;
        }
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

    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `brainsait-alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${this.getAlertIcon(type)}</span>
                <span class="alert-message">${message}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    getAlertIcon(type) {
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

    // Cleanup
    destroy() {
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
        }
        if (this.map) {
            this.map.remove();
        }
    }
}

// Global instance
let brainsaitSsdp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    brainsaitSsdp = new BrainSAIT_SSDP();
});

// Global functions for HTML onclick handlers
window.toggleTheme = () => brainsaitSsdp?.toggleTheme();
window.toggleLanguage = () => brainsaitSsdp?.toggleLanguage();
window.toggleSidebar = () => console.log('Sidebar toggle - BrainSAIT SSDP');

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    brainsaitSsdp?.destroy();
});
