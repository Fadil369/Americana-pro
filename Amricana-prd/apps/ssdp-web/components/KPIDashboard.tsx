// BRAINSAIT: KPI metrics dashboard component
// NEURAL: Glass morphism design with bilingual support
// BILINGUAL: Complete Arabic/English support with RTL

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  Users,
  RotateCcw,
  Zap,
  Clock,
  Smile,
  DollarSign,
  Activity
} from 'lucide-react'
import { KPIData, KPIMetric } from '../types/dashboard'

interface KPIDashboardProps {
  data: KPIData
  locale?: string
  isRTL?: boolean
}

export default function KPIDashboard({ data, locale = 'ar', isRTL = true }: KPIDashboardProps) {
  const t = {
    ar: {
      title: 'مؤشرات الأداء الرئيسية',
      subtitle: 'مقاييس النجاح لمنصة توزيع الحلويات الذكية',
      target: 'الهدف',
      current: 'الحالي',
      lastUpdated: 'آخر تحديث',
      categories: {
        adoption: 'التبني الرقمي',
        retention: 'الاحتفاظ بالعملاء',
        efficiency: 'الكفاءة التشغيلية',
        satisfaction: 'رضا المستخدمين',
        financial: 'الأداء المالي'
      }
    },
    en: {
      title: 'Key Performance Indicators',
      subtitle: 'Success metrics for Smart Sweet Distribution Platform',
      target: 'Target',
      current: 'Current',
      lastUpdated: 'Last Updated',
      categories: {
        adoption: 'Digital Adoption',
        retention: 'Customer Retention',
        efficiency: 'Operational Efficiency',
        satisfaction: 'User Satisfaction',
        financial: 'Financial Performance'
      }
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const getCategoryIcon = (category: KPIMetric['category']) => {
    switch (category) {
      case 'adoption':
        return <Activity className="w-5 h-5" />
      case 'retention':
        return <RotateCcw className="w-5 h-5" />
      case 'efficiency':
        return <Zap className="w-5 h-5" />
      case 'satisfaction':
        return <Smile className="w-5 h-5" />
      case 'financial':
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getTrendIcon = (trend: KPIMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getProgressColor = (metric: KPIMetric) => {
    const percentage = (metric.current_value / metric.target_value) * 100
    if (percentage >= 100) return 'text-green-600 bg-green-500/10 border-green-500/30'
    if (percentage >= 75) return 'text-blue-600 bg-blue-500/10 border-blue-500/30'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30'
    return 'text-red-600 bg-red-500/10 border-red-500/30'
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value}${unit}`
    if (unit === 'days') return locale === 'ar' ? `${value} يوم` : `${value} days`
    if (unit === 'SAR') return locale === 'ar' ? `${value} ر.س` : `SAR ${value}`
    if (unit === '/5.0') return `${value}${unit}`
    return `${value}${unit}`
  }

  const calculateProgress = (metric: KPIMetric) => {
    return Math.min((metric.current_value / metric.target_value) * 100, 100)
  }

  // Group metrics by category
  const groupedMetrics = data.metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, KPIMetric[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-brand-blue" />
              <h3 className="text-xl font-semibold text-gray-800">{text.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{text.subtitle}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <Clock className="w-4 h-4 inline-block mr-1" />
            {text.lastUpdated}: {new Date(data.last_updated).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
          </div>
        </div>
      </div>

      {/* KPI Categories */}
      {Object.entries(groupedMetrics).map(([category, metrics], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="glass rounded-xl p-6"
        >
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-4">
            {getCategoryIcon(category as KPIMetric['category'])}
            <h4 className="text-lg font-semibold text-gray-800">
              {text.categories[category as keyof typeof text.categories]}
            </h4>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => {
              const progress = calculateProgress(metric)
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                  className={`border rounded-lg p-4 ${getProgressColor(metric)}`}
                >
                  {/* Metric Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-1">
                        {locale === 'ar' ? metric.name_ar : metric.name_en}
                      </h5>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <span className="text-xs opacity-70">
                          {text.current}: {formatValue(metric.current_value, metric.unit)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: categoryIndex * 0.1 + index * 0.05 }}
                      className="h-full bg-current"
                    />
                  </div>

                  {/* Target */}
                  <div className="text-xs opacity-70">
                    {text.target}: {formatValue(metric.target_value, metric.unit)}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
