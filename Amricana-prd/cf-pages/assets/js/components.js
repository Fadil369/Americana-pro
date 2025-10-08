// SSDP Components JavaScript
// Additional component functionality

// Chart initialization
function initializeCharts() {
    const salesChart = document.getElementById('sales-chart');
    if (salesChart) {
        // Mock chart implementation
        salesChart.innerHTML = `
            <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #64748b;">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <div>مخطط المبيعات</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">سيتم تحميل البيانات قريباً</div>
                </div>
            </div>
        `;
    }
}

// Map initialization
function initializeMap() {
    const operationsMap = document.getElementById('operations-map');
    if (operationsMap) {
        // Mock map implementation
        operationsMap.innerHTML = `
            <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #64748b; background: #f8fafc; border-radius: 12px;">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                    <div>خريطة العمليات المباشرة</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">الرياض، المملكة العربية السعودية</div>
                </div>
            </div>
        `;
    }

    const outletsMap = document.getElementById('outlets-map');
    if (outletsMap) {
        // Mock outlets map
        outletsMap.innerHTML = `
            <div style="height: 400px; display: flex; align-items: center; justify-content: center; color: #64748b; background: #f8fafc; border-radius: 12px;">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📍</div>
                    <div>خريطة المنافذ</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">عرض جميع المنافذ المسجلة</div>
                </div>
            </div>
        `;
    }
}

// Form validation
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// Search functionality
function setupSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const targetSelector = e.target.dataset.search;
            const items = document.querySelectorAll(targetSelector);
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('#product-search, [data-search]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// Responsive table handling
function makeTablesResponsive() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    initializeMap();
    setupSearch();
    setupKeyboardShortcuts();
    makeTablesResponsive();
});

// Export functions for global use
window.validateForm = validateForm;
window.initializeCharts = initializeCharts;
window.initializeMap = initializeMap;
