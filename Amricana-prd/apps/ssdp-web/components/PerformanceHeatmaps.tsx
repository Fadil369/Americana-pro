import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, DollarSign, Package, Users } from 'lucide-react'

interface HeatmapData {
  region: string
  region_ar: string
  sales: number
  orders: number
  outlets: number
  growth: number
  color: string
}

interface PerformanceHeatmapsProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: Performance heatmaps for regional sales visualization
// NEURAL: Visual performance indicators with heat intensity colors
export default function PerformanceHeatmaps({ locale = 'ar', isRTL = true }: PerformanceHeatmapsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders' | 'outlets' | 'growth'>('sales')
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])

  const t = {
    ar: {
      title: 'خريطة الأداء الحرارية',
      subtitle: 'تصور أداء المبيعات الإقليمي',
      sales: 'المبيعات',
      orders: 'الطلبات',
      outlets: 'المنافذ',
      growth: 'النمو',
      high: 'مرتفع',
      medium: 'متوسط',
      low: 'منخفض',
      riyadh: 'الرياض',
      jeddah: 'جدة',
      dammam: 'الدمام',
      mecca: 'مكة المكرمة',
      medina: 'المدينة المنورة',
      khobar: 'الخبر',
      taif: 'الطائف',
      abha: 'أبها',
      sar: 'ريال',
      outlets_count: 'منفذ',
      orders_count: 'طلب',
      performance: 'الأداء',
      topRegion: 'المنطقة الأعلى أداءً',
      needsAttention: 'يحتاج إلى اهتمام'
    },
    en: {
      title: 'Performance Heatmaps',
      subtitle: 'Regional Sales Performance Visualization',
      sales: 'Sales',
      orders: 'Orders',
      outlets: 'Outlets',
      growth: 'Growth',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      riyadh: 'Riyadh',
      jeddah: 'Jeddah',
      dammam: 'Dammam',
      mecca: 'Mecca',
      medina: 'Medina',
      khobar: 'Khobar',
      taif: 'Taif',
      abha: 'Abha',
      sar: 'SAR',
      outlets_count: 'Outlets',
      orders_count: 'Orders',
      performance: 'Performance',
      topRegion: 'Top Performing Region',
      needsAttention: 'Needs Attention'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  useEffect(() => {
    // BRAINSAIT: Mock regional performance data - in production, fetch from analytics API
    const regions: HeatmapData[] = [
      { region: 'Riyadh', region_ar: 'الرياض', sales: 250000, orders: 620, outlets: 180, growth: 15.5, color: '#ef4444' },
      { region: 'Jeddah', region_ar: 'جدة', sales: 180000, orders: 450, outlets: 145, growth: 12.3, color: '#f97316' },
      { region: 'Dammam', region_ar: 'الدمام', sales: 120000, orders: 310, outlets: 95, growth: 8.7, color: '#f59e0b' },
      { region: 'Mecca', region_ar: 'مكة المكرمة', sales: 95000, orders: 240, outlets: 75, growth: 22.1, color: '#84cc16' },
      { region: 'Medina', region_ar: 'المدينة المنورة', sales: 85000, orders: 220, outlets: 68, growth: 18.9, color: '#22c55e' },
      { region: 'Khobar', region_ar: 'الخبر', sales: 75000, orders: 190, outlets: 58, growth: 6.2, color: '#fbbf24' },
      { region: 'Taif', region_ar: 'الطائف', sales: 55000, orders: 145, outlets: 42, growth: 4.5, color: '#a3e635' },
      { region: 'Abha', region_ar: 'أبها', sales: 42000, orders: 115, outlets: 35, growth: 3.2, color: '#fde047' }
    ]

    setHeatmapData(regions)
  }, [])

  const getMetricValue = (region: HeatmapData) => {
    switch (selectedMetric) {
      case 'sales': return region.sales
      case 'orders': return region.orders
      case 'outlets': return region.outlets
      case 'growth': return region.growth
      default: return region.sales
    }
  }

  const getIntensityColor = (value: number, max: number) => {
    const intensity = (value / max) * 100
    if (intensity >= 70) return 'from-red-500/80 to-orange-600/80'
    if (intensity >= 40) return 'from-orange-500/70 to-yellow-500/70'
    return 'from-yellow-500/60 to-green-500/60'
  }

  const sortedData = [...heatmapData].sort((a, b) => getMetricValue(b) - getMetricValue(a))
  const maxValue = Math.max(...sortedData.map(getMetricValue))
  const topRegion = sortedData[0]
  const bottomRegion = sortedData[sortedData.length - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{text.title}</h2>
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
          <DollarSign className="w-4 h-4" />
          {text.sales}
        </button>
        <button
          onClick={() => setSelectedMetric('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            selectedMetric === 'orders'
              ? 'bg-brand-orange text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Package className="w-4 h-4" />
          {text.orders}
        </button>
        <button
          onClick={() => setSelectedMetric('outlets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            selectedMetric === 'outlets'
              ? 'bg-brand-orange text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Users className="w-4 h-4" />
          {text.outlets}
        </button>
        <button
          onClick={() => setSelectedMetric('growth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            selectedMetric === 'growth'
              ? 'bg-brand-orange text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {text.growth}
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {sortedData.map((region, idx) => {
          const value = getMetricValue(region)
          const percentage = (value / maxValue) * 100
          const isTop = idx === 0
          const isBottom = idx === sortedData.length - 1

          return (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-2xl p-4 overflow-hidden ${
                isTop ? 'ring-2 ring-green-400' : isBottom ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {/* Background gradient based on intensity */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${getIntensityColor(value, maxValue)} opacity-80`}
                style={{ opacity: percentage / 100 }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <h3 className="font-bold text-white text-sm">
                    {locale === 'ar' ? region.region_ar : region.region}
                  </h3>
                </div>
                
                <div className="text-2xl font-bold text-white mb-1">
                  {selectedMetric === 'sales' && `${(value / 1000).toFixed(0)}K`}
                  {selectedMetric === 'orders' && value}
                  {selectedMetric === 'outlets' && value}
                  {selectedMetric === 'growth' && `${value}%`}
                </div>
                
                <div className="text-xs text-white/80">
                  {selectedMetric === 'sales' && text.sar}
                  {selectedMetric === 'orders' && text.orders_count}
                  {selectedMetric === 'outlets' && text.outlets_count}
                  {selectedMetric === 'growth' && text.growth}
                </div>

                {isTop && (
                  <div className="mt-2 text-xs bg-green-500/30 text-green-100 px-2 py-1 rounded-lg inline-block">
                    {text.topRegion}
                  </div>
                )}
                {isBottom && (
                  <div className="mt-2 text-xs bg-yellow-500/30 text-yellow-100 px-2 py-1 rounded-lg inline-block">
                    {text.needsAttention}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">{text.topRegion}</p>
              <p className="text-lg font-bold text-white">
                {locale === 'ar' ? topRegion?.region_ar : topRegion?.region}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">{text.performance}</span>
            <span className="text-green-400 font-semibold">
              {selectedMetric === 'growth' ? `+${topRegion?.growth}%` : getMetricValue(topRegion).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">{text.needsAttention}</p>
              <p className="text-lg font-bold text-white">
                {locale === 'ar' ? bottomRegion?.region_ar : bottomRegion?.region}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">{text.performance}</span>
            <span className="text-yellow-400 font-semibold">
              {selectedMetric === 'growth' ? `+${bottomRegion?.growth}%` : getMetricValue(bottomRegion).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
