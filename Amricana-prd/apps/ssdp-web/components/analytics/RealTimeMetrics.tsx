import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Truck, Activity, Zap } from 'lucide-react'

interface RealTimeMetricsProps {
  locale?: string
  isRTL?: boolean
}

// NEURAL: Real-time metrics with animated stats overlays
// BRAINSAIT: Live data updates with role-based visibility
export default function RealTimeMetrics({ locale, isRTL }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState({
    revenue: 345670,
    orders: 1247,
    customers: 892,
    vehicles: 34,
    avgOrderValue: 277,
    deliveryRate: 94.5,
    responseTime: 2.3,
    systemLoad: 67
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        revenue: prev.revenue + Math.floor(Math.random() * 1000) - 400,
        orders: prev.orders + Math.floor(Math.random() * 3) - 1,
        customers: prev.customers + Math.floor(Math.random() * 5) - 2,
        vehicles: Math.max(20, prev.vehicles + Math.floor(Math.random() * 3) - 1),
        avgOrderValue: prev.avgOrderValue + Math.floor(Math.random() * 10) - 5,
        deliveryRate: Math.min(99, Math.max(85, prev.deliveryRate + (Math.random() * 2 - 1))),
        responseTime: Math.max(1, prev.responseTime + (Math.random() * 0.5 - 0.25)),
        systemLoad: Math.min(95, Math.max(40, prev.systemLoad + Math.floor(Math.random() * 10) - 5))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const copy = {
    ar: {
      title: 'المقاييس المباشرة',
      subtitle: 'تحديثات في الزمن الفعلي',
      revenue: 'الإيرادات اليوم',
      orders: 'الطلبات النشطة',
      customers: 'العملاء النشطون',
      vehicles: 'المركبات الميدانية',
      avgOrder: 'متوسط قيمة الطلب',
      delivery: 'معدل التسليم',
      response: 'زمن الاستجابة',
      system: 'حمل النظام',
      live: 'مباشر',
      min: 'دقيقة',
      sar: 'ر.س'
    },
    en: {
      title: 'Real-Time Metrics',
      subtitle: 'Live updates every 3 seconds',
      revenue: 'Revenue Today',
      orders: 'Active Orders',
      customers: 'Active Customers',
      vehicles: 'Field Vehicles',
      avgOrder: 'Avg Order Value',
      delivery: 'Delivery Rate',
      response: 'Response Time',
      system: 'System Load',
      live: 'Live',
      min: 'min',
      sar: 'SAR'
    }
  }

  const dictionary = copy[locale as keyof typeof copy] || copy.ar

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(Math.floor(value))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value)

  const stats = [
    {
      key: 'revenue',
      label: dictionary.revenue,
      value: formatCurrency(metrics.revenue),
      change: '+8.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-brand-orange/80 to-brand-orange/30',
      glow: 'bg-brand-orange/20'
    },
    {
      key: 'orders',
      label: dictionary.orders,
      value: formatNumber(metrics.orders),
      change: '+12',
      trend: 'up' as const,
      icon: Package,
      color: 'from-blue-500/80 to-blue-500/30',
      glow: 'bg-blue-500/20'
    },
    {
      key: 'customers',
      label: dictionary.customers,
      value: formatNumber(metrics.customers),
      change: '+5.3%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-emerald-500/80 to-emerald-500/30',
      glow: 'bg-emerald-500/20'
    },
    {
      key: 'vehicles',
      label: dictionary.vehicles,
      value: formatNumber(metrics.vehicles),
      change: '+2',
      trend: 'up' as const,
      icon: Truck,
      color: 'from-purple-500/80 to-purple-500/30',
      glow: 'bg-purple-500/20'
    },
    {
      key: 'avgOrder',
      label: dictionary.avgOrder,
      value: `${formatNumber(metrics.avgOrderValue)} ${dictionary.sar}`,
      change: '-1.2%',
      trend: 'down' as const,
      icon: Activity,
      color: 'from-amber-500/80 to-amber-500/30',
      glow: 'bg-amber-500/20'
    },
    {
      key: 'delivery',
      label: dictionary.delivery,
      value: `${metrics.deliveryRate.toFixed(1)}%`,
      change: '+0.3%',
      trend: 'up' as const,
      icon: Zap,
      color: 'from-teal-500/80 to-teal-500/30',
      glow: 'bg-teal-500/20'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{dictionary.title}</h2>
          <p className="text-sm text-white/60">{dictionary.subtitle}</p>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 border border-emerald-500/30"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {dictionary.live}
        </motion.div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
          >
            <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${stat.glow}`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>

              <div className="space-y-1">
                <motion.div 
                  key={stat.value}
                  initial={{ opacity: 0.7, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xl font-bold text-white"
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
