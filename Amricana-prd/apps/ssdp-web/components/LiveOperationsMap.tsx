import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Truck, Store, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues
const OperationsMapInner = dynamic(() => import('./maps/OperationsMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface LiveOperationsMapProps {
  locale?: string
  isRTL?: boolean
}

export default function LiveOperationsMap({ locale, isRTL }: LiveOperationsMapProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [liveData, setLiveData] = useState({
    vehicles: 24,
    outlets: 1234,
    deliveries: 89
  })

  const t = {
    ar: {
      title: 'العمليات المباشرة',
      subtitle: 'خريطة العمليات في الوقت الفعلي',
      vehicles: 'المركبات',
      outlets: 'المنافذ',
      deliveries: 'التوصيلات',
      all: 'الكل',
      riyadh: 'الرياض، المملكة العربية السعودية'
    },
    en: {
      title: 'Live Operations',
      subtitle: 'Real-time operations map',
      vehicles: 'Vehicles',
      outlets: 'Outlets',
      deliveries: 'Deliveries',
      all: 'All',
      riyadh: 'Riyadh, Saudi Arabia'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const filters = [
    { key: 'all', label: text.all, icon: MapPin, count: liveData.vehicles + liveData.outlets },
    { key: 'vehicles', label: text.vehicles, icon: Truck, count: liveData.vehicles },
    { key: 'outlets', label: text.outlets, icon: Store, count: liveData.outlets },
    { key: 'deliveries', label: text.deliveries, icon: Navigation, count: liveData.deliveries }
  ]

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        vehicles: prev.vehicles + Math.floor(Math.random() * 3) - 1,
        outlets: prev.outlets + Math.floor(Math.random() * 5) - 2,
        deliveries: prev.deliveries + Math.floor(Math.random() * 4) - 1
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 h-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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

        {/* Live Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-red-500 rounded-full"
          />
          <span className="text-sm font-medium text-gray-700">
            {locale === 'ar' ? 'مباشر' : 'LIVE'}
          </span>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex space-x-2 rtl:space-x-reverse mb-4 overflow-x-auto"
      >
        {filters.map((filter, index) => (
          <motion.button
            key={filter.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(filter.key)}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.key
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <filter.icon className="w-4 h-4" />
            <span>{filter.label}</span>
            <motion.span
              key={filter.count}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`px-2 py-1 rounded-full text-xs ${
                activeFilter === filter.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {filter.count}
            </motion.span>
          </motion.button>
        ))}
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="h-48 bg-gray-100 rounded-lg overflow-hidden relative"
      >
        <OperationsMapInner filter={activeFilter} locale={locale} />
        
        {/* Map Overlay Info */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">{text.riyadh}</span>
          </div>
        </div>

        {/* Saudi Flag */}
        <div className="absolute top-4 right-4 text-2xl">
          🇸🇦
        </div>
      </motion.div>
    </motion.div>
  )
}
