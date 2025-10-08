// BRAINSAIT: Analytics aggregator worker for SSDP platform
// NEURAL: Real-time analytics and KPI tracking
// CLOUDFLARE: Runs on Cloudflare Workers edge network

export interface Env {
  SSDP_DB: D1Database;
  SSDP_KV: KVNamespace;
  ANALYTICS_BUCKET: R2Bucket;
}

interface SalesMetrics {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  total_customers: number;
  total_products_sold: number;
}

interface RegionalMetrics {
  region: string;
  sales: number;
  orders: number;
  growth_rate: number;
}

interface ProductMetrics {
  product_id: string;
  product_name: string;
  product_name_ar: string;
  units_sold: number;
  revenue: number;
  rank: number;
}

interface PerformanceMetrics {
  sales_rep_id: string;
  sales_rep_name: string;
  total_sales: number;
  total_visits: number;
  conversion_rate: number;
  target_achievement: number;
  rank: number;
}

interface DashboardAnalytics {
  period: string;
  sales_metrics: SalesMetrics;
  regional_metrics: RegionalMetrics[];
  top_products: ProductMetrics[];
  top_performers: PerformanceMetrics[];
  trends: {
    daily_sales: Array<{ date: string; sales: number; orders: number }>;
    monthly_comparison: Array<{ month: string; sales: number }>;
  };
}

// Helper function to calculate date ranges
function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  let start = new Date();
  
  switch (period) {
    case 'today':
      start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      break;
    case 'week':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;
    case 'quarter':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      start = new Date(end.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { start, end };
}

// Mock data generator (replace with actual database queries)
function generateMockSalesMetrics(): SalesMetrics {
  return {
    total_sales: 1250000 + Math.random() * 100000,
    total_orders: 450 + Math.floor(Math.random() * 50),
    average_order_value: 2500 + Math.random() * 500,
    total_customers: 120 + Math.floor(Math.random() * 20),
    total_products_sold: 1800 + Math.floor(Math.random() * 200)
  };
}

function generateMockRegionalMetrics(): RegionalMetrics[] {
  const regions = [
    { name: 'Riyadh', base: 500000 },
    { name: 'Jeddah', base: 350000 },
    { name: 'Dammam', base: 250000 },
    { name: 'Mecca', base: 200000 },
    { name: 'Medina', base: 150000 }
  ];
  
  return regions.map(region => ({
    region: region.name,
    sales: region.base + Math.random() * 50000,
    orders: 50 + Math.floor(Math.random() * 30),
    growth_rate: -10 + Math.random() * 30 // -10% to +20%
  }));
}

function generateMockProductMetrics(): ProductMetrics[] {
  const products = [
    { id: 'PRD001', name: 'Baklava', name_ar: 'بقلاوة', base: 150000 },
    { id: 'PRD002', name: 'Kunafa', name_ar: 'كنافة', base: 120000 },
    { id: 'PRD003', name: 'Maamoul', name_ar: 'معمول', base: 100000 },
    { id: 'PRD004', name: 'Basbousa', name_ar: 'بسبوسة', base: 90000 },
    { id: 'PRD005', name: 'Qatayef', name_ar: 'قطايف', base: 80000 }
  ];
  
  return products.map((product, idx) => ({
    product_id: product.id,
    product_name: product.name,
    product_name_ar: product.name_ar,
    units_sold: 500 + Math.floor(Math.random() * 200),
    revenue: product.base + Math.random() * 20000,
    rank: idx + 1
  }));
}

function generateMockPerformanceMetrics(): PerformanceMetrics[] {
  const reps = [
    { id: 'REP001', name: 'Ahmed Al-Rashid' },
    { id: 'REP002', name: 'Mohammed Al-Otaibi' },
    { id: 'REP003', name: 'Khalid Al-Malki' },
    { id: 'REP004', name: 'Abdullah Al-Dossary' },
    { id: 'REP005', name: 'Fahad Al-Ghamdi' }
  ];
  
  return reps.map((rep, idx) => ({
    sales_rep_id: rep.id,
    sales_rep_name: rep.name,
    total_sales: 250000 - idx * 30000 + Math.random() * 10000,
    total_visits: 80 - idx * 10 + Math.floor(Math.random() * 10),
    conversion_rate: 65 - idx * 5 + Math.random() * 10,
    target_achievement: 110 - idx * 8 + Math.random() * 5,
    rank: idx + 1
  }));
}

function generateMockDailySales(days: number): Array<{ date: string; sales: number; orders: number }> {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      sales: 35000 + Math.random() * 15000,
      orders: 12 + Math.floor(Math.random() * 8)
    });
  }
  
  return data;
}

function generateMockMonthlySales(): Array<{ month: string; sales: number }> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map(month => ({
    month,
    sales: 800000 + Math.random() * 400000
  }));
}

// Main handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Analytics Aggregator Worker',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get dashboard analytics
    if (url.pathname === '/analytics/dashboard') {
      try {
        const period = url.searchParams.get('period') || 'month';
        const dateRange = getDateRange(period);
        
        // Check cache first
        const cacheKey = `analytics:dashboard:${period}:${dateRange.end.toISOString().split('T')[0]}`;
        
        if (env.SSDP_KV) {
          const cached = await env.SSDP_KV.get(cacheKey);
          if (cached) {
            return new Response(cached, {
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'X-Cache': 'HIT'
              }
            });
          }
        }
        
        // Generate analytics (replace with actual database queries)
        const analytics: DashboardAnalytics = {
          period,
          sales_metrics: generateMockSalesMetrics(),
          regional_metrics: generateMockRegionalMetrics(),
          top_products: generateMockProductMetrics(),
          top_performers: generateMockPerformanceMetrics(),
          trends: {
            daily_sales: generateMockDailySales(30),
            monthly_comparison: generateMockMonthlySales()
          }
        };
        
        const response = JSON.stringify({
          success: true,
          data: analytics,
          generated_at: new Date().toISOString()
        });
        
        // Cache for 5 minutes
        if (env.SSDP_KV) {
          await env.SSDP_KV.put(cacheKey, response, { expirationTtl: 300 });
        }
        
        return new Response(response, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Cache': 'MISS'
          }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Get sales metrics
    if (url.pathname === '/analytics/sales') {
      const period = url.searchParams.get('period') || 'month';
      
      return new Response(JSON.stringify({
        success: true,
        period,
        metrics: generateMockSalesMetrics(),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get regional performance
    if (url.pathname === '/analytics/regions') {
      return new Response(JSON.stringify({
        success: true,
        regions: generateMockRegionalMetrics(),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get product performance
    if (url.pathname === '/analytics/products') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const products = generateMockProductMetrics().slice(0, limit);
      
      return new Response(JSON.stringify({
        success: true,
        products,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get sales rep performance
    if (url.pathname === '/analytics/performance') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const performers = generateMockPerformanceMetrics().slice(0, limit);
      
      return new Response(JSON.stringify({
        success: true,
        performers,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get trends
    if (url.pathname === '/analytics/trends') {
      const days = parseInt(url.searchParams.get('days') || '30');
      
      return new Response(JSON.stringify({
        success: true,
        trends: {
          daily_sales: generateMockDailySales(days),
          monthly_comparison: generateMockMonthlySales()
        },
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Export analytics report
    if (url.pathname === '/analytics/export' && request.method === 'POST') {
      try {
        const { period, format } = await request.json();
        
        const analytics: DashboardAnalytics = {
          period: period || 'month',
          sales_metrics: generateMockSalesMetrics(),
          regional_metrics: generateMockRegionalMetrics(),
          top_products: generateMockProductMetrics(),
          top_performers: generateMockPerformanceMetrics(),
          trends: {
            daily_sales: generateMockDailySales(30),
            monthly_comparison: generateMockMonthlySales()
          }
        };
        
        // Store in R2 bucket
        if (env.ANALYTICS_BUCKET) {
          const fileName = `analytics-report-${Date.now()}.json`;
          await env.ANALYTICS_BUCKET.put(fileName, JSON.stringify(analytics, null, 2));
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Report exported successfully',
            message_ar: 'تم تصدير التقرير بنجاح',
            file_name: fileName
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: analytics
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Default response
    return new Response(JSON.stringify({
      service: 'SSDP Analytics Aggregator Worker',
      version: '1.0.0',
      endpoints: {
        'GET /analytics/dashboard': 'Get comprehensive dashboard analytics',
        'GET /analytics/sales': 'Get sales metrics',
        'GET /analytics/regions': 'Get regional performance',
        'GET /analytics/products': 'Get product performance',
        'GET /analytics/performance': 'Get sales rep performance',
        'GET /analytics/trends': 'Get sales trends',
        'POST /analytics/export': 'Export analytics report',
        'GET /health': 'Health check'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },
};
