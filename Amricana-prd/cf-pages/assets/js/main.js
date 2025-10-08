// SSDP - Smart Sweet Distribution Platform
// Advanced JavaScript with API integration and real-time features

class SSDP {
    constructor() {
        this.apiBase = 'https://ssdp-api.brainsait.workers.dev/api';
        this.currentLang = 'ar';
        this.currentTheme = 'light';
        this.cache = new Map();
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.hideLoadingScreen();
        this.startRealTimeUpdates();
    }

    // API Methods
    async apiCall(endpoint, options = {}) {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        
        // Check cache first
        if (options.method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes
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
            
            // Cache GET requests
            if (options.method === 'GET' || !options.method) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error('API Call failed:', error);
            this.showNotification('خطأ في الاتصال بالخادم', 'error');
            throw error;
        }
    }

    // Data Loading
    async loadInitialData() {
        try {
            const [dashboardData, products, outlets] = await Promise.all([
                this.apiCall('/analytics/dashboard'),
                this.apiCall('/products'),
                this.apiCall('/outlets')
            ]);

            this.updateDashboardStats(dashboardData);
            this.renderProducts(products.products || []);
            this.renderOutlets(outlets.outlets || []);
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    // Dashboard Updates
    updateDashboardStats(data) {
        const stats = {
            'total-sales': this.formatCurrency(data.total_sales_today || 125430),
            'active-vehicles': data.active_vehicles || 24,
            'active-customers': data.active_customers || 1234,
            'completed-orders': data.completed_orders || 89
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateCounter(element, value);
            }
        });

        // Update date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = new Intl.DateTimeFormat('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date());
        }
    }

    // Products Management
    async renderProducts(products) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        grid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.sku}">
                <div class="product-header">
                    <div class="product-image">
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${product.name_ar}" loading="lazy">` :
                            '<div class="product-placeholder">🍯</div>'
                        }
                        ${product.requires_refrigeration ? '<span class="refrigeration-badge">❄️</span>' : ''}
                    </div>
                    <div class="product-actions">
                        <button onclick="ssdp.editProduct('${product.sku}')" class="btn-icon">✏️</button>
                        <button onclick="ssdp.deleteProduct('${product.sku}')" class="btn-icon">🗑️</button>
                    </div>
                </div>
                
                <div class="product-content">
                    <h3 class="product-name">${this.currentLang === 'ar' ? product.name_ar : product.name_en}</h3>
                    <p class="product-description">${this.currentLang === 'ar' ? product.description_ar : product.description_en}</p>
                    
                    <div class="product-meta">
                        <span class="product-category">${product.category}</span>
                        <span class="product-brand">${product.brand}</span>
                    </div>
                    
                    <div class="product-footer">
                        <div class="product-price">${this.formatCurrency(product.price)}</div>
                        <div class="product-stock ${product.stock_quantity < 10 ? 'low-stock' : ''}">
                            المخزون: ${product.stock_quantity}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.product-actions')) {
                    const productId = card.dataset.productId;
                    this.showProductDetails(productId);
                }
            });
        });
    }

    // Outlets Management
    async renderOutlets(outlets) {
        const list = document.getElementById('outlets-list');
        if (!list) return;

        list.innerHTML = outlets.map(outlet => `
            <div class="outlet-card" data-outlet-id="${outlet.id}">
                <div class="outlet-header">
                    <div class="outlet-info">
                        <h3 class="outlet-name">${outlet.name_ar}</h3>
                        <p class="outlet-address">${outlet.address}</p>
                        <div class="outlet-meta">
                            <span class="outlet-city">${outlet.city}</span>
                            <span class="outlet-status ${outlet.status}">${outlet.status}</span>
                        </div>
                    </div>
                    <div class="outlet-actions">
                        <button onclick="ssdp.viewOutletOnMap('${outlet.id}')" class="btn btn-secondary">📍 الموقع</button>
                        <button onclick="ssdp.createOrder('${outlet.id}')" class="btn btn-primary">+ طلب جديد</button>
                    </div>
                </div>
                
                <div class="outlet-stats">
                    <div class="stat-item">
                        <span class="stat-label">آخر طلب</span>
                        <span class="stat-value">${this.formatDate(outlet.last_order)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">إجمالي الطلبات</span>
                        <span class="stat-value">${outlet.total_orders || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">الرصيد</span>
                        <span class="stat-value ${outlet.credit_balance < 0 ? 'negative' : ''}">${this.formatCurrency(outlet.credit_balance || 0)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.showSection(target);
                this.updateActiveNav(link);
            });
        });

        // Search and filters
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

        // Forms
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductSubmit(e.target);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        document.getElementById('product-search')?.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.openProductModal();
                        break;
                }
            }
        });

        // Window events
        window.addEventListener('online', () => {
            this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
            this.loadInitialData();
        });

        window.addEventListener('offline', () => {
            this.showNotification('لا يوجد اتصال بالإنترنت', 'warning');
        });
    }

    // UI Methods
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load section-specific data
            switch (sectionId) {
                case 'products':
                    this.loadProducts();
                    break;
                case 'outlets':
                    this.loadOutlets();
                    break;
                case 'analytics':
                    this.loadAnalytics();
                    break;
            }
        }
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    openProductModal(productData = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        
        if (productData) {
            // Edit mode
            Object.keys(productData).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = productData[key];
            });
        } else {
            // Add mode
            form.reset();
        }
        
        this.openModal('product-modal');
    }

    // Form Handlers
    async handleProductSubmit(form) {
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        
        // Convert numeric fields
        productData.price = parseFloat(productData.price);
        productData.cost = parseFloat(productData.cost) || 0;
        productData.stock_quantity = parseInt(productData.stock_quantity);
        productData.requires_refrigeration = formData.has('requires_refrigeration');

        try {
            this.showLoading(true);
            
            await this.apiCall('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            this.showNotification('تم حفظ المنتج بنجاح', 'success');
            this.closeModal('product-modal');
            this.loadProducts();
            
        } catch (error) {
            this.showNotification('فشل في حفظ المنتج', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        return new Intl.DateTimeFormat('ar-SA').format(new Date(dateString));
    }

    animateCounter(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = typeof targetValue === 'string' ? targetValue : currentValue.toLocaleString('ar-SA');

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
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

        // Auto remove after 5 seconds
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

    showLoading(show) {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loader = document.getElementById('loading-screen');
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 1000);
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.apiCall('/analytics/dashboard').then(data => {
                    this.updateDashboardStats(data);
                }).catch(() => {
                    // Silently fail for real-time updates
                });
            }
        }, 30000);
    }

    // Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }

    // Theme and Language
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('ssdp-theme', this.currentTheme);
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('lang', this.currentLang);
        document.documentElement.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('ssdp-lang', this.currentLang);
        
        // Reload content in new language
        this.loadInitialData();
    }
}

// Global instance
const ssdp = new SSDP();

// Global functions for HTML onclick handlers
window.toggleTheme = () => ssdp.toggleTheme();
window.toggleLanguage = () => ssdp.toggleLanguage();
window.openProductModal = () => ssdp.openProductModal();
window.closeModal = (id) => ssdp.closeModal(id);
window.toggleNav = () => {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('active');
};
