// BRAINSAIT: Implementation roadmap tracker component
// NEURAL: Glass morphism design with bilingual support
// BILINGUAL: Complete Arabic/English support with RTL

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Target } from 'lucide-react'
import { RoadmapData, RoadmapPhase } from '../types/dashboard'

interface RoadmapTrackerProps {
  data: RoadmapData
  locale?: string
  isRTL?: boolean
}

export default function RoadmapTracker({ data, locale = 'ar', isRTL = true }: RoadmapTrackerProps) {
  const t = {
    ar: {
      title: 'خارطة طريق التنفيذ',
      overallProgress: 'التقدم الإجمالي',
      currentPhase: 'المرحلة الحالية',
      completed: 'مكتمل',
      inProgress: 'قيد التنفيذ',
      planned: 'مخطط',
      months: 'أشهر'
    },
    en: {
      title: 'Implementation Roadmap',
      overallProgress: 'Overall Progress',
      currentPhase: 'Current Phase',
      completed: 'Completed',
      inProgress: 'In Progress',
      planned: 'Planned',
      months: 'months'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const getStatusColor = (status: RoadmapPhase['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10 border-green-500/30'
      case 'in-progress':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30'
      case 'planned':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getStatusIcon = (status: RoadmapPhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />
      case 'in-progress':
        return <Clock className="w-5 h-5" />
      case 'planned':
        return <Circle className="w-5 h-5" />
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-brand-blue" />
          <h3 className="text-xl font-semibold text-gray-800">{text.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">{text.overallProgress}</div>
          <div className="text-2xl font-bold text-brand-blue">{data.overall_progress}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.overall_progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand-blue to-brand-teal"
          />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {data.phases.map((phase, index) => (
          <motion.div
            key={phase.phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getStatusColor(phase.status)}`}
          >
            {/* Phase Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(phase.status)}
                <div>
                  <h4 className="font-semibold text-lg">
                    {locale === 'ar' ? phase.name_ar : phase.name_en}
                  </h4>
                  <p className="text-sm opacity-80">{phase.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{phase.progress}%</div>
                {phase.phase === data.current_phase && (
                  <div className="text-xs font-semibold uppercase tracking-wide">
                    {text.currentPhase}
                  </div>
                )}
              </div>
            </div>

            {/* Phase Progress Bar */}
            <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${phase.progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="h-full bg-current"
              />
            </div>

            {/* Phase Items */}
            <div className="grid grid-cols-1 gap-2">
              {phase.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 text-sm ${
                    item.completed ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{locale === 'ar' ? item.title_ar : item.title_en}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">{text.completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">{text.inProgress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{text.planned}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
