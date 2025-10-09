import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react'
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface FinancialDashboardProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: Financial analytics dashboard with revenue and profit metrics
// NEURAL: Glass morphism with animated charts
export default function FinancialDashboard({ locale, isRTL }: FinancialDashboardProps) {
  const copy = {
    ar: {
      title: 'لوحة المالية',
      subtitle: 'تحليلات الإيرادات والربحية',
      revenue: 'الإيرادات',
      profit: 'صافي الربح',
      margin: 'هامش الربح',
      expenses: 'المصروفات',
      growth: 'النمو',
      thisMonth: 'هذا الشهر',
      lastMonth: 'الشهر الماضي',
      byCategory: 'حسب الفئة',
      traditional: 'تقليدية',
      refrigerated: 'مبردة',
      seasonal: 'موسمية',
      sar: 'ر.س'
    },
    en: {
      title: 'Financial Dashboard',
      subtitle: 'Revenue and profitability analytics',
      revenue: 'Revenue',
      profit: 'Net Profit',
      margin: 'Profit Margin',
      expenses: 'Expenses',
      growth: 'Growth',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      byCategory: 'By Category',
      traditional: 'Traditional',
      refrigerated: 'Refrigerated',
      seasonal: 'Seasonal',
      sar: 'SAR'
    }
  }

  const dictionary = copy[locale as keyof typeof copy] || copy.ar

  const monthlyData = [
    { month: locale === 'ar' ? 'يناير' : 'Jan', revenue: 450000, profit: 135000 },
    { month: locale === 'ar' ? 'فبراير' : 'Feb', revenue: 520000, profit: 156000 },
    { month: locale === 'ar' ? 'مارس' : 'Mar', revenue: 480000, profit: 144000 },
    { month: locale === 'ar' ? 'أبريل' : 'Apr', revenue: 580000, profit: 174000 },
    { month: locale === 'ar' ? 'مايو' : 'May', revenue: 620000, profit: 186000 }
  ]

  const categoryData = [
    { 
      name: dictionary.traditional, 
      value: 350000, 
      color: '#f97316' 
    },
    { 
      name: dictionary.refrigerated, 
      value: 200000, 
      color: '#0ea5e9' 
    },
    { 
      name: dictionary.seasonal, 
      value: 70000, 
      color: '#8b5cf6' 
    }
  ]

  const financialStats = {
    revenue: 620000,
    revenueGrowth: 12.5,
    profit: 186000,
    profitGrowth: 8.3,
    profitMargin: 30,
    expenses: 434000,
    expensesChange: -2.1
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl border border-white/10 bg-brand-navy/95 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-xl">
        <p className="font-semibold text-white mb-2">{payload[0].payload.month}</p>
        <p className="text-brand-orange">{dictionary.revenue}: {formatCurrency(payload[0].value)}</p>
        {payload[1] && <p className="text-emerald-400">{dictionary.profit}: {formatCurrency(payload[1].value)}</p>}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      
      <div className="relative">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-1">{dictionary.title}</h3>
          <p className="text-sm text-white/60">{dictionary.subtitle}</p>
        </div>

        {/* Financial Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/20">
                <DollarSign className="h-4 w-4 text-brand-orange" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.revenue}</span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{formatCurrency(financialStats.revenue)}</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              +{financialStats.revenueGrowth}%
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.profit}</span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{formatCurrency(financialStats.profit)}</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              +{financialStats.profitGrowth}%
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.margin}</span>
            </div>
            <p className="text-xl font-bold text-white">{financialStats.profitMargin}%</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
                <TrendingDown className="h-4 w-4 text-rose-400" />
              </div>
              <span className="text-xs text-white/60 uppercase tracking-wider">{dictionary.expenses}</span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{formatCurrency(financialStats.expenses)}</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingDown className="h-3 w-3" />
              {financialStats.expensesChange}%
            </div>
          </div>
        </div>

        {/* Revenue & Profit Chart */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {dictionary.thisMonth}
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ left: isRTL ? 0 : 8, right: isRTL ? 8 : 0, top: 10, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {dictionary.byCategory}
          </h4>
          <div className="flex items-center justify-between">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/80">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
