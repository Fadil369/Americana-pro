import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Truck, Store, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

const OperationsMapInner = dynamic(() => import('./maps/OperationsMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-60 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-sm text-white/60">
      Loading live telemetry…
    </div>
  )
})

interface LiveOperationsMapProps {
  locale?: string
  isRTL?: boolean
}

const localeCopy = {
  ar: {
    title: 'العمليات المباشرة',
    subtitle: 'مؤشر الأداء الميداني في الزمن الحقيقي',
    all: 'الكل',
    vehicles: 'المركبات',
    outlets: 'المنافذ',
    deliveries: 'التوصيلات',
    spot: 'الرياض · المملكة العربية السعودية',
    live: 'مباشر'
  },
  en: {
    title: 'Live Operations',
    subtitle: 'Field performance index in real time',
    all: 'All',
    vehicles: 'Vehicles',
    outlets: 'Outlets',
    deliveries: 'Deliveries',
    spot: 'Riyadh · Saudi Arabia',
    live: 'Live'
  }
}

export default function LiveOperationsMap({ locale, isRTL }: LiveOperationsMapProps) {
  const dictionary = localeCopy[(locale as keyof typeof localeCopy) || 'ar']
  type FilterKey = 'all' | 'vehicles' | 'outlets' | 'deliveries'
  type LiveMetrics = { vehicles: number; outlets: number; deliveries: number }

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [liveData, setLiveData] = useState<LiveMetrics>({ vehicles: 24, outlets: 1234, deliveries: 89 })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev: LiveMetrics) => ({
        vehicles: Math.max(0, prev.vehicles + Math.floor(Math.random() * 3) - 1),
        outlets: Math.max(0, prev.outlets + Math.floor(Math.random() * 5) - 2),
        deliveries: Math.max(0, prev.deliveries + Math.floor(Math.random() * 4) - 1)
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const filters = [
    { key: 'all' as const, label: dictionary.all, icon: MapPin, count: liveData.vehicles + liveData.outlets },
    { key: 'vehicles' as const, label: dictionary.vehicles, icon: Truck, count: liveData.vehicles },
    { key: 'outlets' as const, label: dictionary.outlets, icon: Store, count: liveData.outlets },
    { key: 'deliveries' as const, label: dictionary.deliveries, icon: Navigation, count: liveData.deliveries }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-card backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-brand-sheen" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <motion.h3
              initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-semibold"
            >
              {dictionary.title}
            </motion.h3>
            <p className="mt-1 text-sm text-white/60">{dictionary.subtitle}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange"
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="absolute h-full w-full rounded-full bg-brand-orange"
              />
            </span>
            {dictionary.live}
          </motion.div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter, index) => (
            <motion.button
              key={filter.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setActiveFilter(filter.key)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                activeFilter === filter.key
                  ? 'border-brand-orange/60 bg-brand-orange/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/8'
              }`}
            >
              <filter.icon className="h-3.5 w-3.5" />
              <span>{filter.label}</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">
                {filter.count}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="relative mt-4 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <OperationsMapInner filter={activeFilter} locale={locale} />
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} max-w-[220px] rounded-2xl border border-white/10 bg-brand-navy/80 px-4 py-3 text-xs text-white/70 backdrop-blur-xl`}> 
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-brand-orange" />
              <span>{dictionary.spot}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase text-white/40">{dictionary.vehicles}</p>
                <p className="text-sm font-semibold text-accent-blue">{liveData.vehicles}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-white/40">{dictionary.outlets}</p>
                <p className="text-sm font-semibold text-accent-teal">{liveData.outlets}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-white/40">{dictionary.deliveries}</p>
                <p className="text-sm font-semibold text-brand-orange">{liveData.deliveries}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
