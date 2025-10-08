import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PredictiveAnalyticsProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: Predictive analytics component for sales, inventory, and cash flow forecasting
// MEDICAL: Following same architectural patterns as BrainSAIT healthcare analytics
export default function PredictiveAnalytics({ locale = 'ar', isRTL = true }: PredictiveAnalyticsProps) {
  const [forecastData, setForecastData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'inventory' | 'cashflow'>('sales')

  const t = {
    ar: {
      title: 'التحليلات التنبؤية',
      subtitle: 'توقعات المبيعات والمخزون والتدفق النقدي',
      sales: 'المبيعات',
      inventory: 'المخزون',
      cashflow: 'التدفق النقدي',
      forecast: 'التوقعات',
      actual: 'الفعلي',
      days: 'أيام',
      prediction: 'التنبؤ',
      confidence: 'الثقة',
      trend: 'الاتجاه',
      up: 'تصاعدي',
      down: 'تنازلي',
      stable: 'مستقر',
      insights: 'رؤى ذكية',
      ramadan: 'رمضان المبارك - توقع زيادة بنسبة 350%',
      eid: 'عيد الفطر - ذروة الطلب',
      nationalDay: 'اليوم الوطني - زيادة متوقعة',
      normal: 'نشاط طبيعي',
      stockAlert: 'تنبيه مخزون منخفض',
      restockNow: 'إعادة التخزين الآن',
      stockOk: 'المخزون جيد',
      cashflowPositive: 'تدفق نقدي إيجابي',
      cashflowNegative: 'تحذير: تدفق نقدي سلبي متوقع',
      units: 'وحدات',
      sar: 'ريال',
      loading: 'جاري تحميل البيانات...'
    },
    en: {
      title: 'Predictive Analytics',
      subtitle: 'Sales, Inventory & Cash Flow Forecasting',
      sales: 'Sales',
      inventory: 'Inventory',
      cashflow: 'Cash Flow',
      forecast: 'Forecast',
      actual: 'Actual',
      days: 'Days',
      prediction: 'Prediction',
      confidence: 'Confidence',
      trend: 'Trend',
      up: 'Upward',
      down: 'Downward',
      stable: 'Stable',
      insights: 'Smart Insights',
      ramadan: 'Ramadan - Expect 350% surge',
      eid: 'Eid Al-Fitr - Peak demand',
      nationalDay: 'National Day - Expected increase',
      normal: 'Normal activity',
      stockAlert: 'Low stock alert',
      restockNow: 'Restock now',
      stockOk: 'Stock levels OK',
      cashflowPositive: 'Positive cash flow',
      cashflowNegative: 'Warning: Negative cash flow expected',
      units: 'Units',
      sar: 'SAR',
      loading: 'Loading data...'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  useEffect(() => {
    // BRAINSAIT: Fetch AI forecasting data from service
    const fetchForecast = async () => {
      setLoading(true)
      try {
        // Simulate API call to AI forecasting service
        const response = await fetch('http://localhost:8001/forecast/demand?days_ahead=30&region=Riyadh')
        const data = await response.json()
        
        // Transform data for charts
        const chartData = data.predictions?.slice(0, 14).map((pred: any, idx: number) => ({
          day: idx + 1,
          sales: pred.forecasted_units * 50, // Convert units to SAR
          inventory: 10000 - (idx * 300),
          cashflow: 50000 + (idx * 2000) - (idx * idx * 100),
          confidence: pred.confidence * 100,
          culturalFactor: pred.cultural_multiplier,
          reason_ar: pred.reason_ar,
          reason_en: pred.reason_en
        }))
        
        setForecastData(chartData)
      } catch (error) {
        // Fallback to mock data if service unavailable
        const mockData = Array.from({ length: 14 }, (_, i) => ({
          day: i + 1,
          sales: 45000 + Math.random() * 15000 + (i * 500),
          inventory: 10000 - (i * 300),
          cashflow: 50000 + (i * 2000) - (i * i * 100),
          confidence: 85 + Math.random() * 10,
          culturalFactor: i > 7 ? 4.5 : 1.0,
          reason_ar: i > 7 ? text.ramadan : text.normal,
          reason_en: i > 7 ? text.ramadan : text.normal
        }))
        setForecastData(mockData)
      }
      setLoading(false)
    }

    fetchForecast()
  }, [selectedMetric])

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-white/60">{text.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  const getMetricData = () => {
    if (!forecastData || !Array.isArray(forecastData)) return []
    return forecastData.map((d: any) => ({
      day: d.day || 0,
      value: selectedMetric === 'sales' ? (d.sales || 0) : selectedMetric === 'inventory' ? (d.inventory || 0) : (d.cashflow || 0),
      confidence: d.confidence || 0
    }))
  }

  const getTrend = () => {
    const data = getMetricData()
    if (!data || data.length < 2) return 'stable'
    const lastValue = data[data.length - 1]?.value || 0
    const firstValue = data[0]?.value || 0
    if (firstValue === 0) return 'stable'
    const change = ((lastValue - firstValue) / firstValue) * 100
    
    if (change > 5) return 'up'
    if (change < -5) return 'down'
    return 'stable'
  }

  const trend = getTrend()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{text.title}</h2>
          <div className="flex items-center gap-2">
            {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
            <span className="text-sm text-white/70">{text.trend}: {text[trend as keyof typeof text]}</span>
          </div>
        </div>
        <p className="text-white/60 text-sm">{text.subtitle}</p>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-3 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <button
          onClick={() => setSelectedMetric('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            selectedMetric === 'sales'
              ? 'bg-brand-orange text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {text.sales}
        </button>
        <button
          onClick={() => setSelectedMetric('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            selectedMetric === 'inventory'
              ? 'bg-brand-orange text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Package className="w-4 h-4" />
          {text.inventory}
        </button>
        <button
          onClick={() => setSelectedMetric('cashflow')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            selectedMetric === 'cashflow'
              ? 'bg-brand-orange text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {text.cashflow}
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white/5 rounded-2xl p-4 mb-6">
        {getMetricData().length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getMetricData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="day" 
              stroke="rgba(255,255,255,0.5)"
              label={{ value: text.days, position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              label={{ 
                value: selectedMetric === 'sales' || selectedMetric === 'cashflow' ? text.sar : text.units, 
                angle: -90, 
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.7)'
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#f97316" 
              strokeWidth={3}
              name={text.forecast}
              dot={{ fill: '#f97316', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name={text.confidence + ' %'}
              dot={{ fill: '#0ea5e9', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-white/60">No data available</p>
          </div>
        )}
      </div>

      {/* Smart Insights */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">{text.insights}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {forecastData && Array.isArray(forecastData) && forecastData.slice(0, 4).map((item: any, idx: number) => {
            const isHighDemand = (item?.culturalFactor || 0) > 2
            const isLowStock = selectedMetric === 'inventory' && (item?.inventory || 0) < 5000
            const isNegativeCash = selectedMetric === 'cashflow' && (item?.cashflow || 0) < 0
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl ${
                  isHighDemand ? 'bg-orange-500/20 border border-orange-500/30' :
                  isLowStock ? 'bg-red-500/20 border border-red-500/30' :
                  isNegativeCash ? 'bg-red-500/20 border border-red-500/30' :
                  'bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isHighDemand && <TrendingUp className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />}
                  {isLowStock && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />}
                  {isNegativeCash && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />}
                  {!isHighDemand && !isLowStock && !isNegativeCash && (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {locale === 'ar' ? `اليوم ${item?.day || 0}` : `Day ${item?.day || 0}`}
                    </p>
                    <p className="text-xs text-white/70 mt-1">
                      {locale === 'ar' ? (item?.reason_ar || '') : (item?.reason_en || '')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
