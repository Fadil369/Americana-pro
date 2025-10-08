// SSDP API Helper Functions
// Additional API utilities and helpers

class APIHelper {
    static formatError(error) {
        if (error.response) {
            return `خطأ ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
            return 'لا يمكن الوصول للخادم';
        } else {
            return 'حدث خطأ غير متوقع';
        }
    }
    
    static formatCurrency(amount, currency = 'SAR') {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    static formatDate(dateString, locale = 'ar-SA') {
        if (!dateString) return 'غير محدد';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(dateString));
    }
    
    static formatDateTime(dateString, locale = 'ar-SA') {
        if (!dateString) return 'غير محدد';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static validatePhone(phone) {
        // Saudi phone number validation
        const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    static validateCRNumber(crNumber) {
        // Saudi Commercial Registration number validation
        const crRegex = /^\d{10}$/;
        return crRegex.test(crNumber);
    }
    
    static generateSKU(category, brand) {
        const categoryCode = category.substring(0, 3).toUpperCase();
        const brandCode = brand.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        return `${brandCode}-${categoryCode}-${timestamp}`;
    }
    
    static calculateVAT(amount, rate = 0.15) {
        return Math.round(amount * rate * 100) / 100;
    }
    
    static calculateTotal(subtotal, vatRate = 0.15) {
        const vat = this.calculateVAT(subtotal, vatRate);
        return subtotal + vat;
    }
    
    static debounce(func, wait) {
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
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        }
    }
    
    static downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    static exportToCSV(data, filename) {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Cache management
class CacheManager {
    constructor(prefix = 'ssdp_') {
        this.prefix = prefix;
    }
    
    set(key, value, ttl = 300000) { // 5 minutes default
        const item = {
            value,
            timestamp: Date.now(),
            ttl
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
    }
    
    get(key) {
        const item = localStorage.getItem(this.prefix + key);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > parsed.ttl) {
            this.remove(key);
            return null;
        }
        
        return parsed.value;
    }
    
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

// Export for global use
window.APIHelper = APIHelper;
window.CacheManager = CacheManager;
