import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, AlertCircle, DollarSign, Package, Navigation, XCircle } from 'lucide-react'

interface Anomaly {
  id: string
  type: 'payment' | 'inventory' | 'route' | 'order'
  severity: 'high' | 'medium' | 'low'
  title: string
  title_ar: string
  description: string
  description_ar: string
  detected_at: string
  resolved: boolean
  location?: string
  location_ar?: string
  value?: number
}

interface AnomalyDetectionProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: AI-powered anomaly detection for payments, inventory, and routes
// MEDICAL: Following BrainSAIT's clinical anomaly detection patterns
export default function AnomalyDetection({ locale = 'ar', isRTL = true }: AnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [filter, setFilter] = useState<'all' | 'payment' | 'inventory' | 'route' | 'order'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const t = {
    ar: {
      title: 'كشف الشذوذ الذكي',
      subtitle: 'مراقبة الحالات غير الطبيعية في النظام',
      all: 'الكل',
      payment: 'المدفوعات',
      inventory: 'المخزون',
      route: 'المسارات',
      order: 'الطلبات',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      severity: 'الخطورة',
      resolved: 'تم الحل',
      active: 'نشط',
      detectedAt: 'وقت الاكتشاف',
      noAnomalies: 'لا توجد شذوذات',
      allGood: 'كل شيء يعمل بشكل طبيعي!',
      anomaliesFound: 'تم العثور على شذوذات',
      requiresAttention: 'يتطلب اهتماماً',
      // Anomaly descriptions
      paymentFailed: 'فشل الدفع المتكرر',
      paymentFailedDesc: 'منفذ {outlet} فشل في 5 محاولات دفع متتالية',
      unusualOrder: 'طلب غير عادي',
      unusualOrderDesc: 'طلب بقيمة {amount} ريال - أعلى 3 مرات من المتوسط',
      stockShortage: 'نقص حاد في المخزون',
      stockShortageDesc: 'منتج {product} تحت الحد الأدنى بنسبة 80%',
      routeDeviation: 'انحراف عن المسار',
      routeDeviationDesc: 'سائق {driver} انحرف 15 كم عن المسار المخطط',
      lateDelivery: 'تأخير في التسليم',
      lateDeliveryDesc: 'تأخر التسليم 3 ساعات عن الموعد المحدد',
      duplicatePayment: 'دفع مكرر محتمل',
      duplicatePaymentDesc: 'دفعتان بنفس المبلغ خلال 5 دقائق'
    },
    en: {
      title: 'Smart Anomaly Detection',
      subtitle: 'Monitoring Unusual System Activities',
      all: 'All',
      payment: 'Payments',
      inventory: 'Inventory',
      route: 'Routes',
      order: 'Orders',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      severity: 'Severity',
      resolved: 'Resolved',
      active: 'Active',
      detectedAt: 'Detected at',
      noAnomalies: 'No anomalies detected',
      allGood: 'Everything is running smoothly!',
      anomaliesFound: 'Anomalies Found',
      requiresAttention: 'Requires Attention',
      // Anomaly descriptions
      paymentFailed: 'Repeated Payment Failure',
      paymentFailedDesc: 'Outlet {outlet} failed 5 consecutive payment attempts',
      unusualOrder: 'Unusual Order Size',
      unusualOrderDesc: 'Order worth {amount} SAR - 3x above average',
      stockShortage: 'Critical Stock Shortage',
      stockShortageDesc: 'Product {product} 80% below minimum threshold',
      routeDeviation: 'Route Deviation',
      routeDeviationDesc: 'Driver {driver} deviated 15km from planned route',
      lateDelivery: 'Delivery Delay',
      lateDeliveryDesc: 'Delivery delayed by 3 hours from scheduled time',
      duplicatePayment: 'Potential Duplicate Payment',
      duplicatePaymentDesc: 'Two payments of same amount within 5 minutes'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  useEffect(() => {
    // BRAINSAIT: Mock anomaly detection data - in production, use ML models
    const mockAnomalies: Anomaly[] = [
      {
        id: 'AN001',
        type: 'payment',
        severity: 'high',
        title: text.paymentFailed,
        title_ar: 'فشل الدفع المتكرر',
        description: 'Outlet CR-12345 failed 5 consecutive payment attempts',
        description_ar: 'منفذ CR-12345 فشل في 5 محاولات دفع متتالية',
        detected_at: new Date(Date.now() - 3600000).toISOString(),
        resolved: false,
        location: 'Riyadh - Al Malaz',
        location_ar: 'الرياض - الملز',
        value: 12500
      },
      {
        id: 'AN002',
        type: 'order',
        severity: 'medium',
        title: text.unusualOrder,
        title_ar: 'طلب غير عادي',
        description: 'Order worth 45,000 SAR - 3x above average',
        description_ar: 'طلب بقيمة 45,000 ريال - أعلى 3 مرات من المتوسط',
        detected_at: new Date(Date.now() - 7200000).toISOString(),
        resolved: false,
        location: 'Jeddah - Al Hamra',
        location_ar: 'جدة - الحمراء',
        value: 45000
      },
      {
        id: 'AN003',
        type: 'inventory',
        severity: 'high',
        title: text.stockShortage,
        title_ar: 'نقص حاد في المخزون',
        description: 'Product "Kunafa" 80% below minimum threshold',
        description_ar: 'منتج "كنافة" تحت الحد الأدنى بنسبة 80%',
        detected_at: new Date(Date.now() - 1800000).toISOString(),
        resolved: false,
        value: 50
      },
      {
        id: 'AN004',
        type: 'route',
        severity: 'medium',
        title: text.routeDeviation,
        title_ar: 'انحراف عن المسار',
        description: 'Driver Ahmed deviated 15km from planned route',
        description_ar: 'سائق أحمد انحرف 15 كم عن المسار المخطط',
        detected_at: new Date(Date.now() - 5400000).toISOString(),
        resolved: false,
        location: 'Dammam - Route 34',
        location_ar: 'الدمام - مسار 34'
      },
      {
        id: 'AN005',
        type: 'route',
        severity: 'low',
        title: text.lateDelivery,
        title_ar: 'تأخير في التسليم',
        description: 'Delivery delayed by 3 hours',
        description_ar: 'تأخر التسليم 3 ساعات عن الموعد المحدد',
        detected_at: new Date(Date.now() - 10800000).toISOString(),
        resolved: true,
        location: 'Mecca',
        location_ar: 'مكة المكرمة'
      },
      {
        id: 'AN006',
        type: 'payment',
        severity: 'medium',
        title: text.duplicatePayment,
        title_ar: 'دفع مكرر محتمل',
        description: 'Two payments of same amount within 5 minutes',
        description_ar: 'دفعتان بنفس المبلغ خلال 5 دقائق',
        detected_at: new Date(Date.now() - 14400000).toISOString(),
        resolved: true,
        value: 8500
      }
    ]

    setAnomalies(mockAnomalies)
  }, [])

  const filteredAnomalies = anomalies.filter(anomaly => {
    const typeMatch = filter === 'all' || anomaly.type === filter
    const severityMatch = severityFilter === 'all' || anomaly.severity === severityFilter
    return typeMatch && severityMatch
  })

  const activeAnomalies = filteredAnomalies.filter(a => !a.resolved)
  const resolvedAnomalies = filteredAnomalies.filter(a => a.resolved)

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return DollarSign
      case 'inventory': return Package
      case 'route': return Navigation
      default: return AlertCircle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 border-red-500/30 text-red-400'
      case 'medium': return 'bg-orange-500/20 border-orange-500/30 text-orange-400'
      case 'low': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      default: return 'bg-white/10 border-white/10 text-white'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-5 h-5" />
      case 'medium': return <AlertTriangle className="w-5 h-5" />
      case 'low': return <AlertCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{text.title}</h2>
        <p className="text-white/60 text-sm">{text.subtitle}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-3xl font-bold text-white mb-1">{activeAnomalies.length}</div>
          <div className="text-xs text-white/60">{text.active}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-3xl font-bold text-green-400 mb-1">{resolvedAnomalies.length}</div>
          <div className="text-xs text-white/60">{text.resolved}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {activeAnomalies.filter(a => a.severity === 'high').length}
          </div>
          <div className="text-xs text-white/60">{text.high} {text.severity}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-3xl font-bold text-orange-400 mb-1">
            {activeAnomalies.filter(a => a.severity === 'medium').length}
          </div>
          <div className="text-xs text-white/60">{text.medium} {text.severity}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              filter === 'all' ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {text.all}
          </button>
          <button
            onClick={() => setFilter('payment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              filter === 'payment' ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            {text.payment}
          </button>
          <button
            onClick={() => setFilter('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              filter === 'inventory' ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Package className="w-4 h-4" />
            {text.inventory}
          </button>
          <button
            onClick={() => setFilter('route')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              filter === 'route' ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Navigation className="w-4 h-4" />
            {text.route}
          </button>
          <button
            onClick={() => setFilter('order')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              filter === 'order' ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {text.order}
          </button>
        </div>

        <div className="flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              severityFilter === 'all' ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {text.all} {text.severity}
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              severityFilter === 'high' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {text.high}
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              severityFilter === 'medium' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {text.medium}
          </button>
          <button
            onClick={() => setSeverityFilter('low')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              severityFilter === 'low' ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {text.low}
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      {filteredAnomalies.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{text.noAnomalies}</h3>
          <p className="text-white/60">{text.allGood}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnomalies.map((anomaly, idx) => {
            const Icon = getIcon(anomaly.type)
            return (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl p-4 border ${getSeverityColor(anomaly.severity)} ${
                  anomaly.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-white">
                        {locale === 'ar' ? anomaly.title_ar : anomaly.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(anomaly.severity)}
                        {anomaly.resolved && <CheckCircle className="w-5 h-5 text-green-400" />}
                      </div>
                    </div>
                    <p className="text-sm text-white/80 mb-2">
                      {locale === 'ar' ? anomaly.description_ar : anomaly.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      {anomaly.location && (
                        <span>📍 {locale === 'ar' ? anomaly.location_ar : anomaly.location}</span>
                      )}
                      {anomaly.value && (
                        <span>💰 {anomaly.value.toLocaleString()} SAR</span>
                      )}
                      <span>
                        {text.detectedAt}: {new Date(anomaly.detected_at).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
