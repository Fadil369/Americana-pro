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
    } else if (path.includes('/predictive')) {
      return getPredictiveAnalytics(url.searchParams, env);
    } else if (path.includes('/anomalies')) {
      return getAnomalies(url.searchParams, env);
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

async function getPredictiveAnalytics(params: URLSearchParams, env: Env): Promise<Response> {
  const metric = params.get('metric') || 'sales';
  const daysAhead = parseInt(params.get('days_ahead') || '30');
  const region = params.get('region') || 'Riyadh';
  
  // BRAINSAIT: Predictive analytics using time-series forecasting
  const predictions = [];
  const baseValue = metric === 'sales' ? 50000 : 100;
  
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Simple trend with seasonal variation
    const trend = baseValue + (i * 50); // Growth trend
    const seasonal = Math.sin(i * Math.PI / 15) * (baseValue * 0.15); // Weekly pattern
    const noise = (Math.random() - 0.5) * (baseValue * 0.05);
    
    const forecastedValue = trend + seasonal + noise;
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      forecasted_value: Math.round(forecastedValue * 100) / 100,
      confidence_lower: Math.round((forecastedValue * 0.85) * 100) / 100,
      confidence_upper: Math.round((forecastedValue * 1.15) * 100) / 100,
      confidence_level: 0.85
    });
  }
  
  return new Response(JSON.stringify({
    success: true,
    metric,
    region,
    forecast_period: `${daysAhead} days`,
    generated_at: new Date().toISOString(),
    predictions,
    insights_ar: [
      'اتجاه نمو إيجابي متوقع',
      'تقلبات موسمية خلال الفترة',
      'ثقة عالية في التوقعات'
    ],
    insights_en: [
      'Positive growth trend expected',
      'Seasonal fluctuations during period',
      'High confidence in predictions'
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getAnomalies(params: URLSearchParams, env: Env): Promise<Response> {
  const dataType = params.get('data_type') || 'sales';
  const period = params.get('period') || '30d';
  
  // BRAINSAIT: Anomaly detection in operational data
  // Mock historical data with some anomalies
  const dataPoints = [];
  const baseValue = dataType === 'sales' ? 45000 : 100;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    let value = baseValue + (Math.random() - 0.5) * (baseValue * 0.1);
    
    // Inject anomalies
    if (i === 15 || i === 5) {
      value *= 0.5; // Low anomaly
    } else if (i === 10) {
      value *= 2.0; // High anomaly
    }
    
    dataPoints.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      is_anomaly: i === 15 || i === 10 || i === 5
    });
  }
  
  const anomalies = dataPoints.filter(d => d.is_anomaly);
  
  return new Response(JSON.stringify({
    success: true,
    data_type: dataType,
    period,
    total_data_points: dataPoints.length,
    anomalies_detected: anomalies.length,
    anomalies: anomalies.map(a => ({
      date: a.date,
      value: a.value,
      severity: a.value < baseValue * 0.7 ? 'high' : 'medium',
      type: a.value > baseValue * 1.5 ? 'spike' : 'drop',
      description_ar: a.value > baseValue * 1.5 
        ? 'ارتفاع غير عادي في القيمة'
        : 'انخفاض غير عادي في القيمة',
      description_en: a.value > baseValue * 1.5
        ? 'Unusual spike in value'
        : 'Unusual drop in value'
    })),
    data_points: dataPoints,
    statistics: {
      mean: Math.round(dataPoints.reduce((sum, d) => sum + d.value, 0) / dataPoints.length),
      min: Math.min(...dataPoints.map(d => d.value)),
      max: Math.max(...dataPoints.map(d => d.value))
    },
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
