import { Env } from '../index';
import { corsHeaders } from '../utils/cors';

export async function analyticsHandler(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path.includes('/dashboard')) {
      return getDashboardAnalytics(env);
    } else if (path.includes('/sales')) {
      return getSalesAnalytics(url.searchParams, env);
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getDashboardAnalytics(env: Env): Promise<Response> {
  // Mock analytics data - in production, query from D1 database
  const analytics = {
    total_sales_today: 125430.50,
    active_vehicles: 24,
    active_customers: 1234,
    completed_orders: 89,
    pending_orders: 12,
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

  return new Response(JSON.stringify({
    success: true,
    data: analytics,
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getSalesAnalytics(params: URLSearchParams, env: Env): Promise<Response> {
  const period = params.get('period') || 'week';
  const region = params.get('region');
  
  // Mock sales data
  const salesData = {
    period,
    region: region || 'all',
    total_sales: 450000.00,
    growth_rate: 12.5,
    orders_count: 1250,
    average_order_value: 360.00,
    by_category: [
      { category: 'حلويات مبردة', sales: 180000, percentage: 40 },
      { category: 'حلويات تقليدية', sales: 270000, percentage: 60 }
    ],
    by_region: [
      { region: 'الرياض', sales: 200000, orders: 550 },
      { region: 'جدة', sales: 150000, orders: 420 },
      { region: 'الدمام', sales: 100000, orders: 280 }
    ]
  };

  return new Response(JSON.stringify({
    success: true,
    data: salesData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
