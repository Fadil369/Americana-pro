import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Truck, Users, Package } from 'lucide-react'

interface StatsCardsProps {
  data: any
  locale?: string
  isRTL?: boolean
}

const textMap = {
  ar: {
    totalSales: 'إجمالي المبيعات اليوم',
    activeVehicles: 'المركبات النشطة',
    activeCustomers: 'العملاء النشطون',
    completedOrders: 'الطلبات المكتملة',
    change: 'التغير',
    baseline: 'الأساس'
  },
  en: {
    totalSales: 'Total Sales Today',
    activeVehicles: 'Active Vehicles',
    activeCustomers: 'Active Customers',
    completedOrders: 'Completed Orders',
    change: 'Change',
    baseline: 'Baseline'
  }
}

const formatCurrency = (amount: number, locale?: string) =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)

const formatNumber = (value: number, locale?: string) =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(value)

export default function StatsCards({ data, locale }: StatsCardsProps) {
  const dictionary = textMap[(locale as keyof typeof textMap) || 'ar']

  const stats = [
    {
      key: 'total_sales_today',
      label: dictionary.totalSales,
      value: formatCurrency(data.total_sales_today ?? 0, locale),
      delta: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      accent: 'from-brand-orange/80 to-brand-orange/30',
      halo: 'bg-brand-orange/20'
    },
    {
      key: 'active_vehicles',
      label: dictionary.activeVehicles,
      value: formatNumber(data.active_vehicles ?? 0, locale),
      delta: '+2',
      trend: 'up' as const,
      icon: Truck,
      accent: 'from-accent-blue/80 to-accent-blue/20',
      halo: 'bg-accent-blue/15'
    },
    {
      key: 'active_customers',
      label: dictionary.activeCustomers,
      value: formatNumber(data.active_customers ?? 0, locale),
      delta: '+5.2%',
      trend: 'up' as const,
      icon: Users,
      accent: 'from-accent-teal/80 to-accent-teal/20',
      halo: 'bg-accent-teal/15'
    },
    {
      key: 'completed_orders',
      label: dictionary.completedOrders,
      value: formatNumber(data.completed_orders ?? 0, locale),
      delta: '-1.4%',
      trend: 'down' as const,
      icon: Package,
      accent: 'from-amber-500/80 to-amber-500/20',
      halo: 'bg-amber-400/15'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-card backdrop-blur-xl"
        >
          <div className={`absolute -right-10 top-0 h-32 w-32 rounded-full blur-3xl ${stat.halo}`} />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">{dictionary.change}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{stat.value}</h3>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>

            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${
              stat.trend === 'up' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
            }`}
            >
              {stat.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {stat.delta}
            </div>
            <span className="text-white/40">{dictionary.baseline}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
