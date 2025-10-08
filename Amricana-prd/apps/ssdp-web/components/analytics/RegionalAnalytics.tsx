import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Package, Users, DollarSign } from 'lucide-react'

interface RegionalAnalyticsProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: Regional performance analytics with geographic heatmap
// NEURAL: Glass morphism cards with brand mesh gradients
export default function RegionalAnalytics({ locale, isRTL }: RegionalAnalyticsProps) {
  const copy = {
    ar: {
      title: 'التحليلات الإقليمية',
      subtitle: 'أداء المبيعات حسب المناطق',
      sales: 'المبيعات',
      orders: 'الطلبات',
      customers: 'العملاء',
      avgOrder: 'متوسط الطلب',
      growth: 'النمو',
      marketShare: 'حصة السوق',
      performance: 'الأداء',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      sar: 'ر.س'
    },
    en: {
      title: 'Regional Analytics',
      subtitle: 'Sales performance by region',
      sales: 'Sales',
      orders: 'Orders',
      customers: 'Customers',
      avgOrder: 'Avg Order',
      growth: 'Growth',
      marketShare: 'Market Share',
      performance: 'Performance',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      sar: 'SAR'
    }
  }

  const dictionary = copy[locale as keyof typeof copy] || copy.ar

  const regions = [
    {
      id: 'riyadh',
      name: locale === 'ar' ? 'الرياض' : 'Riyadh',
      sales: 285000,
      orders: 892,
      customers: 456,
      avgOrder: 320,
      growth: 15.2,
      marketShare: 42,
      performance: 'high' as const,
      color: 'from-emerald-500/30 to-emerald-500/10',
      glow: 'bg-emerald-500/20'
    },
    {
      id: 'jeddah',
      name: locale === 'ar' ? 'جدة' : 'Jeddah',
      sales: 215000,
      orders: 678,
      customers: 342,
      avgOrder: 317,
      growth: 12.8,
      marketShare: 32,
      performance: 'high' as const,
      color: 'from-emerald-500/30 to-emerald-500/10',
      glow: 'bg-emerald-500/20'
    },
    {
      id: 'dammam',
      name: locale === 'ar' ? 'الدمام' : 'Dammam',
      sales: 145000,
      orders: 456,
      customers: 234,
      avgOrder: 318,
      growth: 8.5,
      marketShare: 21,
      performance: 'medium' as const,
      color: 'from-blue-500/30 to-blue-500/10',
      glow: 'bg-blue-500/20'
    },
    {
      id: 'makkah',
      name: locale === 'ar' ? 'مكة المكرمة' : 'Makkah',
      sales: 98000,
      orders: 312,
      customers: 156,
      avgOrder: 314,
      growth: 5.2,
      marketShare: 14,
      performance: 'medium' as const,
      color: 'from-blue-500/30 to-blue-500/10',
      glow: 'bg-blue-500/20'
    },
    {
      id: 'madinah',
      name: locale === 'ar' ? 'المدينة المنورة' : 'Madinah',
      sales: 82000,
      orders: 267,
      customers: 128,
      avgOrder: 307,
      growth: 3.8,
      marketShare: 12,
      performance: 'medium' as const,
      color: 'from-blue-500/30 to-blue-500/10',
      glow: 'bg-blue-500/20'
    },
    {
      id: 'khobar',
      name: locale === 'ar' ? 'الخبر' : 'Khobar',
      sales: 65000,
      orders: 198,
      customers: 98,
      avgOrder: 328,
      growth: 2.1,
      marketShare: 9,
      performance: 'low' as const,
      color: 'from-amber-500/30 to-amber-500/10',
      glow: 'bg-amber-500/20'
    }
  ]

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(value)

  const getPerformanceLabel = (performance: string) => {
    return dictionary[performance as keyof typeof dictionary]
  }

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'high':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'low':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      default:
        return 'bg-white/10 text-white/60 border-white/20'
    }
  }

  const totalSales = regions.reduce((sum, region) => sum + region.sales, 0)
  const totalOrders = regions.reduce((sum, region) => sum + region.orders, 0)
  const totalCustomers = regions.reduce((sum, region) => sum + region.customers, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{dictionary.title}</h3>
            <p className="text-sm text-white/60">{dictionary.subtitle}</p>
          </div>
          <div className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300 border border-blue-500/30">
            <MapPin className="inline h-4 w-4 mr-1" />
            6 {locale === 'ar' ? 'مناطق' : 'Regions'}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/20">
                <DollarSign className="h-4 w-4 text-brand-orange" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.sales}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalSales)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                <Package className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.orders}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatNumber(totalOrders)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.customers}</span>
            </div>
            <p className="text-xl font-bold text-white">{formatNumber(totalCustomers)}</p>
          </div>
        </div>

        {/* Regional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${region.color} p-4`}
            >
              <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${region.glow}`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">{region.name}</h4>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getPerformanceBadge(region.performance)}`}>
                      {getPerformanceLabel(region.performance)}
                    </span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">{dictionary.sales}</span>
                    <span className="font-semibold text-white">{formatCurrency(region.sales)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">{dictionary.orders}</span>
                    <span className="font-semibold text-white">{formatNumber(region.orders)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">{dictionary.avgOrder}</span>
                    <span className="font-semibold text-white">{formatCurrency(region.avgOrder)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">{dictionary.growth}</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{region.growth}%
                    </span>
                  </div>
                </div>

                {/* Market Share Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-white/60 mb-1.5">
                    <span>{dictionary.marketShare}</span>
                    <span className="font-semibold">{region.marketShare}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${region.marketShare}%` }}
                      transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-brand-orange to-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
