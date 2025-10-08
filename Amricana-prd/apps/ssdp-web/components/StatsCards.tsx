import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Truck, Users, Package } from 'lucide-react'

interface StatsCardsProps {
  data: any
  locale?: string
  isRTL?: boolean
}

export default function StatsCards({ data, locale, isRTL }: StatsCardsProps) {
  const t = {
    ar: {
      totalSales: 'إجمالي المبيعات اليوم',
      activeVehicles: 'المركبات النشطة',
      activeCustomers: 'العملاء النشطون',
      completedOrders: 'الطلبات المكتملة',
      currency: 'ريال',
      increase: 'زيادة',
      decrease: 'انخفاض'
    },
    en: {
      totalSales: 'Total Sales Today',
      activeVehicles: 'Active Vehicles',
      activeCustomers: 'Active Customers',
      completedOrders: 'Completed Orders',
      currency: 'SAR',
      increase: 'increase',
      decrease: 'decrease'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num)
  }

  const stats = [
    {
      title: text.totalSales,
      value: formatCurrency(data.total_sales_today || 0),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: text.activeVehicles,
      value: formatNumber(data.active_vehicles || 0),
      change: '+2',
      trend: 'up',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: text.activeCustomers,
      value: formatNumber(data.active_customers || 0),
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: text.completedOrders,
      value: formatNumber(data.completed_orders || 0),
      change: '+8.1%',
      trend: 'up',
      icon: Package,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`glass rounded-xl p-6 border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
              className={`flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{stat.change}</span>
            </motion.div>
          </div>

          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-2xl font-bold text-gray-800 mb-1 font-cairo"
            >
              {stat.value}
            </motion.h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>

          {/* Animated Progress Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
            className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.random() * 40 + 60}%` }}
              transition={{ delay: 1 + index * 0.1, duration: 1 }}
              className={`h-full ${stat.color.replace('text-', 'bg-')} rounded-full`}
            />
          </motion.div>

          {/* Saudi Pattern Decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5 overflow-hidden">
            <div className="w-full h-full bg-saudi-gradient transform rotate-45 translate-x-8 -translate-y-8" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
