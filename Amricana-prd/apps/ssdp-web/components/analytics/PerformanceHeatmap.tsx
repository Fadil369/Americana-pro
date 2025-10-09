import { motion } from 'framer-motion'
import { Award, TrendingUp, Target, Users } from 'lucide-react'

interface PerformanceHeatmapProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: Sales representative performance heatmap
// NEURAL: Color-coded performance visualization with glass morphism
export default function PerformanceHeatmap({ locale, isRTL }: PerformanceHeatmapProps) {
  const copy = {
    ar: {
      title: 'خريطة حرارية للأداء',
      subtitle: 'أداء مندوبي المبيعات في الزمن الفعلي',
      sales: 'المبيعات',
      visits: 'الزيارات',
      conversion: 'معدل التحويل',
      target: 'تحقيق الهدف',
      rank: 'المرتبة',
      top: 'الأفضل',
      excellent: 'ممتاز',
      good: 'جيد',
      average: 'متوسط',
      sar: 'ر.س'
    },
    en: {
      title: 'Performance Heatmap',
      subtitle: 'Sales representative performance in real-time',
      sales: 'Sales',
      visits: 'Visits',
      conversion: 'Conversion',
      target: 'Target Achievement',
      rank: 'Rank',
      top: 'Top',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      sar: 'SAR'
    }
  }

  const dictionary = copy[locale as keyof typeof copy] || copy.ar

  const salesReps = [
    {
      id: 'REP001',
      name: locale === 'ar' ? 'أحمد الراشد' : 'Ahmed Al-Rashid',
      sales: 285000,
      visits: 89,
      conversion: 72.5,
      targetAchievement: 142,
      rank: 1,
      performance: 'excellent' as const
    },
    {
      id: 'REP002',
      name: locale === 'ar' ? 'محمد العتيبي' : 'Mohammed Al-Otaibi',
      sales: 248000,
      visits: 76,
      conversion: 68.2,
      targetAchievement: 124,
      rank: 2,
      performance: 'excellent' as const
    },
    {
      id: 'REP003',
      name: locale === 'ar' ? 'خالد المالكي' : 'Khalid Al-Malki',
      sales: 215000,
      visits: 82,
      conversion: 65.8,
      targetAchievement: 108,
      rank: 3,
      performance: 'good' as const
    },
    {
      id: 'REP004',
      name: locale === 'ar' ? 'عبدالله الدوسري' : 'Abdullah Al-Dossary',
      sales: 192000,
      visits: 71,
      conversion: 61.3,
      targetAchievement: 96,
      rank: 4,
      performance: 'good' as const
    },
    {
      id: 'REP005',
      name: locale === 'ar' ? 'فهد الغامدي' : 'Fahad Al-Ghamdi',
      sales: 178000,
      visits: 68,
      conversion: 58.7,
      targetAchievement: 89,
      rank: 5,
      performance: 'average' as const
    }
  ]

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'from-emerald-500/30 to-emerald-500/10 border-emerald-500/50'
      case 'good':
        return 'from-blue-500/30 to-blue-500/10 border-blue-500/50'
      case 'average':
        return 'from-amber-500/30 to-amber-500/10 border-amber-500/50'
      default:
        return 'from-white/10 to-white/5 border-white/20'
    }
  }

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'good':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'average':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      default:
        return 'bg-white/10 text-white/60 border-white/20'
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{dictionary.title}</h3>
            <p className="text-sm text-white/60">{dictionary.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 border border-purple-500/30">
            <Award className="h-4 w-4" />
            {dictionary.top} 5
          </div>
        </div>

        <div className="space-y-3">
          {salesReps.map((rep, index) => (
            <motion.div
              key={rep.id}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 ${getPerformanceColor(rep.performance)}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-xl font-bold text-white">#{rep.rank}</span>
                </div>

                {/* Rep Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-semibold text-white truncate">{rep.name}</h4>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getPerformanceBadge(rep.performance)}`}>
                      {dictionary[rep.performance as keyof typeof dictionary]}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-white/50 uppercase tracking-wider mb-1">{dictionary.sales}</p>
                      <p className="font-semibold text-white">{formatCurrency(rep.sales)}</p>
                    </div>
                    <div>
                      <p className="text-white/50 uppercase tracking-wider mb-1">{dictionary.visits}</p>
                      <p className="font-semibold text-white">{formatNumber(rep.visits)}</p>
                    </div>
                    <div>
                      <p className="text-white/50 uppercase tracking-wider mb-1">{dictionary.conversion}</p>
                      <p className="font-semibold text-white">{rep.conversion.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-white/50 uppercase tracking-wider mb-1">{dictionary.target}</p>
                      <p className="font-semibold text-emerald-300 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {rep.targetAchievement}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rep.targetAchievement, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-brand-orange to-emerald-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
