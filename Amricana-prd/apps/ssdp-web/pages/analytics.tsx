import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import PerformanceHeatmap from '../components/analytics/PerformanceHeatmap'
import FinancialDashboard from '../components/analytics/FinancialDashboard'
import RegionalAnalytics from '../components/analytics/RegionalAnalytics'
import RealTimeMetrics from '../components/analytics/RealTimeMetrics'

// NEURAL: BrainSAIT Executive Analytics Hub
// BILINGUAL: Full AR/EN support with RTL layouts
export default function AnalyticsHub() {
  const router = useRouter()
  const { locale } = router
  const isRTL = locale === 'ar'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const t = {
    ar: {
      title: 'مركز التحليلات التنفيذية',
      description: 'لوحة تحكم التحليلات المتقدمة في الوقت الفعلي',
      subtitle: 'رؤى استراتيجية للقيادة التنفيذية',
      vision: 'رؤية المملكة 2030',
      performance: 'تحليل الأداء',
      financial: 'لوحة المالية',
      regional: 'التحليلات الإقليمية',
      realtime: 'المقاييس المباشرة'
    },
    en: {
      title: 'Executive Analytics Hub',
      description: 'Advanced real-time analytics dashboard',
      subtitle: 'Strategic insights for executive leadership',
      vision: 'Saudi Vision 2030',
      performance: 'Performance Analysis',
      financial: 'Financial Dashboard',
      regional: 'Regional Analytics',
      realtime: 'Real-Time Metrics'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  return (
    <>
      <Head>
        <title>{text.title} - SSDP</title>
        <meta name="description" content={text.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div 
        className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} 
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          background: 'linear-gradient(120deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))',
          position: 'relative'
        }}
      >
        {/* NEURAL: Mesh gradient background with brand colors */}
        <div className="fixed inset-0 -z-10" style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(249,115,22,0.12), transparent 55%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.14), transparent 45%)'
        }} />
        
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          locale={locale}
          isRTL={isRTL}
        />
        
        <Sidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          locale={locale}
          isRTL={isRTL}
        />

        <main className={`transition-all duration-300 ${sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : ''} pt-16`}>
          <div className="p-6 space-y-6">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-card backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent" />
              <div className="relative text-white">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-bold mb-3"
                >
                  {text.title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-white/80 mb-6"
                >
                  {text.subtitle}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20"
                >
                  🇸🇦 {text.vision}
                </motion.div>
              </div>
            </motion.div>

            {/* Real-Time Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RealTimeMetrics locale={locale} isRTL={isRTL} />
            </motion.div>

            {/* Performance & Financial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <PerformanceHeatmap locale={locale} isRTL={isRTL} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <FinancialDashboard locale={locale} isRTL={isRTL} />
              </motion.div>
            </div>

            {/* Regional Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <RegionalAnalytics locale={locale} isRTL={isRTL} />
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}
