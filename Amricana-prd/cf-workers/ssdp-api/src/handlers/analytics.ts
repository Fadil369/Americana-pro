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
    } else if (path.includes('/roadmap')) {
      return getRoadmapData(env);
    } else if (path.includes('/kpi')) {
      return getKPIData(env);
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

// BRAINSAIT: Implementation roadmap data
async function getRoadmapData(env: Env): Promise<Response> {
  const roadmapData = {
    phases: [
      {
        phase: 1,
        name_en: 'Phase 1: Foundation',
        name_ar: 'المرحلة 1: الأساسات',
        duration: 'Months 1-3 / الأشهر 1-3',
        progress: 45,
        status: 'in-progress',
        items: [
          { id: 'p1-1', title_en: 'Core mobile apps (sales rep, driver)', title_ar: 'تطبيقات الهاتف الأساسية (مندوب المبيعات، السائق)', completed: true },
          { id: 'p1-2', title_en: 'Basic web dashboard', title_ar: 'لوحة التحكم الأساسية', completed: true },
          { id: 'p1-3', title_en: 'Order management system', title_ar: 'نظام إدارة الطلبات', completed: false },
          { id: 'p1-4', title_en: 'ZATCA e-invoicing integration', title_ar: 'تكامل الفوترة الإلكترونية ZATCA', completed: false },
          { id: 'p1-5', title_en: 'Payment processing', title_ar: 'معالجة المدفوعات', completed: false }
        ]
      },
      {
        phase: 2,
        name_en: 'Phase 2: Intelligence',
        name_ar: 'المرحلة 2: الذكاء الاصطناعي',
        duration: 'Months 4-6 / الأشهر 4-6',
        progress: 0,
        status: 'planned',
        items: [
          { id: 'p2-1', title_en: 'AI route optimization', title_ar: 'تحسين المسارات بالذكاء الاصطناعي', completed: false },
          { id: 'p2-2', title_en: 'Demand forecasting engine', title_ar: 'محرك التنبؤ بالطلب', completed: false },
          { id: 'p2-3', title_en: 'Advanced analytics', title_ar: 'التحليلات المتقدمة', completed: false },
          { id: 'p2-4', title_en: 'Customer portal', title_ar: 'بوابة العملاء', completed: false },
          { id: 'p2-5', title_en: 'Performance dashboards', title_ar: 'لوحات الأداء', completed: false }
        ]
      },
      {
        phase: 3,
        name_en: 'Phase 3: Scale',
        name_ar: 'المرحلة 3: التوسع',
        duration: 'Months 7-9 / الأشهر 7-9',
        progress: 0,
        status: 'planned',
        items: [
          { id: 'p3-1', title_en: 'Multi-region support', title_ar: 'دعم المناطق المتعددة', completed: false },
          { id: 'p3-2', title_en: 'Advanced credit management', title_ar: 'إدارة الائتمان المتقدمة', completed: false },
          { id: 'p3-3', title_en: 'Loyalty programs', title_ar: 'برامج الولاء', completed: false },
          { id: 'p3-4', title_en: 'Third-party integrations', title_ar: 'التكاملات مع الأطراف الثالثة', completed: false }
        ]
      },
      {
        phase: 4,
        name_en: 'Phase 4: Innovation',
        name_ar: 'المرحلة 4: الابتكار',
        duration: 'Months 10-12 / الأشهر 10-12',
        progress: 0,
        status: 'planned',
        items: [
          { id: 'p4-1', title_en: 'Computer vision features', title_ar: 'ميزات الرؤية الحاسوبية', completed: false },
          { id: 'p4-2', title_en: 'IoT device integration', title_ar: 'تكامل أجهزة إنترنت الأشياء', completed: false },
          { id: 'p4-3', title_en: 'Blockchain pilot', title_ar: 'تجربة البلوكتشين', completed: false },
          { id: 'p4-4', title_en: 'Autonomous delivery planning', title_ar: 'التخطيط الآلي للتوصيل', completed: false }
        ]
      }
    ],
    overall_progress: 11,
    current_phase: 1
  };

  return new Response(JSON.stringify({
    success: true,
    data: roadmapData,
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// BRAINSAIT: KPI metrics data
async function getKPIData(env: Env): Promise<Response> {
  const kpiData = {
    metrics: [
      {
        id: 'kpi-digital-adoption',
        name_en: 'Digital Adoption Rate',
        name_ar: 'معدل التبني الرقمي',
        current_value: 75,
        target_value: 90,
        unit: '%',
        trend: 'up',
        category: 'adoption'
      },
      {
        id: 'kpi-customer-retention',
        name_en: 'Customer Retention',
        name_ar: 'الاحتفاظ بالعملاء',
        current_value: 82,
        target_value: 85,
        unit: '%',
        trend: 'up',
        category: 'retention'
      },
      {
        id: 'kpi-order-frequency',
        name_en: 'Order Frequency Increase',
        name_ar: 'زيادة معدل الطلبات',
        current_value: 22,
        target_value: 30,
        unit: '%',
        trend: 'up',
        category: 'retention'
      },
      {
        id: 'kpi-invoice-collection',
        name_en: 'Invoice Collection Time',
        name_ar: 'وقت تحصيل الفواتير',
        current_value: 5.2,
        target_value: 7,
        unit: 'days',
        trend: 'up',
        category: 'efficiency'
      },
      {
        id: 'kpi-route-efficiency',
        name_en: 'On-Time Deliveries',
        name_ar: 'التسليم في الوقت المحدد',
        current_value: 93,
        target_value: 95,
        unit: '%',
        trend: 'up',
        category: 'efficiency'
      },
      {
        id: 'kpi-uptime',
        name_en: 'Platform Uptime',
        name_ar: 'وقت تشغيل المنصة',
        current_value: 99.8,
        target_value: 99.9,
        unit: '%',
        trend: 'stable',
        category: 'efficiency'
      },
      {
        id: 'kpi-satisfaction',
        name_en: 'User Satisfaction (NPS)',
        name_ar: 'رضا المستخدمين',
        current_value: 4.6,
        target_value: 4.7,
        unit: '/5.0',
        trend: 'up',
        category: 'satisfaction'
      },
      {
        id: 'kpi-roi',
        name_en: 'Return on Investment',
        name_ar: 'العائد على الاستثمار',
        current_value: 250,
        target_value: 300,
        unit: '%',
        trend: 'up',
        category: 'financial'
      }
    ],
    last_updated: new Date().toISOString()
  };

  return new Response(JSON.stringify({
    success: true,
    data: kpiData,
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
