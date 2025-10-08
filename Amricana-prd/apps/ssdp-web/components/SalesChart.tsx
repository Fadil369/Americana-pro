import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface SalesChartProps {
  data: any[]
  locale?: string
  isRTL?: boolean
}

export default function SalesChart({ data, locale, isRTL }: SalesChartProps) {
  const t = {
    ar: {
      title: 'اتجاه المبيعات',
      subtitle: 'المبيعات اليومية خلال الأسبوع الماضي',
      amount: 'المبلغ',
      date: 'التاريخ',
      currency: 'ريال'
    },
    en: {
      title: 'Sales Trend',
      subtitle: 'Daily sales over the past week',
      amount: 'Amount',
      date: 'Date',
      currency: 'SAR'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  // Format data for chart
  const chartData = data?.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    amount: item.amount,
    index
  })) || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-lg p-3 border border-white/20 shadow-lg"
        >
          <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(payload[0].value)}
          </p>
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 h-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h3
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-gray-800 font-cairo"
          >
            {text.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 mt-1"
          >
            {text.subtitle}
          </motion.p>
        </div>

        {/* Chart Type Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex bg-gray-100 rounded-lg p-1"
        >
          <button className="px-3 py-1 text-xs font-medium bg-white text-primary-600 rounded-md shadow-sm">
            📈 {locale === 'ar' ? 'خطي' : 'Line'}
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-primary-600">
            📊 {locale === 'ar' ? 'عمودي' : 'Bar'}
          </button>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#ea580c"
              strokeWidth={3}
              fill="url(#salesGradient)"
              dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ea580c', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
      >
        <div className="text-center">
          <p className="text-xs text-gray-500">{locale === 'ar' ? 'أعلى مبيعات' : 'Highest'}</p>
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(Math.max(...chartData.map(d => d.amount)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{locale === 'ar' ? 'المتوسط' : 'Average'}</p>
          <p className="text-sm font-semibold text-blue-600">
            {formatCurrency(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{locale === 'ar' ? 'النمو' : 'Growth'}</p>
          <p className="text-sm font-semibold text-primary-600">+12.5%</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
