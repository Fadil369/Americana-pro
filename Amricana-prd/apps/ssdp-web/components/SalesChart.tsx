import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

interface SalesChartProps {
  data: Array<{ date: string; amount: number }>
  locale?: string
  isRTL?: boolean
}

const copy = {
  ar: {
    title: 'اتجاه المبيعات',
    subtitle: 'إشارات المبيعات الأسبوعية لحظة بلحظة',
    highest: 'أعلى قيمة',
    average: 'المتوسط',
    growth: 'النمو',
    empty: 'لا تتوفر بيانات كافية لعرض الرسم البياني'
  },
  en: {
    title: 'Sales Momentum',
    subtitle: 'Week-over-week sales signals in real time',
    highest: 'Peak Value',
    average: 'Average',
    growth: 'Growth',
    empty: 'Not enough data to render the chart yet'
  }
}

export default function SalesChart({ data = [], locale, isRTL }: SalesChartProps) {
  const dictionary = copy[(locale as keyof typeof copy) || 'ar']

  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric'
    }),
    amount: entry.amount
  }))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(value)

  const highestValue = chartData.length ? Math.max(...chartData.map(point => point.amount)) : 0
  const averageValue = chartData.length
    ? chartData.reduce((sum, point) => sum + point.amount, 0) / chartData.length
    : 0

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload?.length) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-brand-navy/95 px-4 py-3 text-sm text-white shadow-lg"
      >
        <p className="font-semibold text-white">{label}</p>
        <p className="text-white/60">{formatCurrency(Number(payload[0]?.value) || 0)}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-card backdrop-blur-xl"
    >
      <div className="absolute left-0 top-0 h-full w-full bg-brand-sheen" />
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-brand-orange/20 blur-3xl" />

      <div className="relative flex flex-col gap-2 pb-6">
        <motion.h3
          initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-semibold"
        >
          {dictionary.title}
        </motion.h3>
        <p className="text-sm text-white/60">{dictionary.subtitle}</p>
      </div>

      <div className="relative h-64">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: isRTL ? 0 : 8, right: isRTL ? 8 : 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesMomentum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4511e" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#f4511e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                tickFormatter={value => `${(value / 1000).toFixed(0)}K`}
                width={64}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#f4511e"
                strokeWidth={3}
                fill="url(#salesMomentum)"
                dot={{ r: 4, strokeWidth: 2, stroke: '#f4511e', fill: '#010409' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f4511e' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-center text-sm text-white/50">
            {dictionary.empty}
          </div>
        )}
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-4 text-xs uppercase tracking-wide text-white/60">
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center">
          <p>{dictionary.highest}</p>
          <p className="mt-2 text-sm font-semibold text-emerald-300">{formatCurrency(highestValue)}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center">
          <p>{dictionary.average}</p>
          <p className="mt-2 text-sm font-semibold text-accent-blue">
            {formatCurrency(Number.isFinite(averageValue) ? averageValue : 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center">
          <p>{dictionary.growth}</p>
          <p className="mt-2 text-sm font-semibold text-brand-orange">+12.5%</p>
        </div>
      </div>
    </motion.div>
  )
}
