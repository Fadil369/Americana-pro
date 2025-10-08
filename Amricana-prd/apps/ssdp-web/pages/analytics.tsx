import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

// Dynamic imports to avoid SSR issues with charts
const PredictiveAnalytics = dynamic(() => import('../components/PredictiveAnalytics'), { ssr: false })
const PerformanceHeatmaps = dynamic(() => import('../components/PerformanceHeatmaps'), { ssr: false })
const AnomalyDetection = dynamic(() => import('../components/AnomalyDetection'), { ssr: false })
const ScenarioPlanning = dynamic(() => import('../components/ScenarioPlanning'), { ssr: false })
const AIChatbot = dynamic(() => import('../components/AIChatbot'), { ssr: false })
const LiveOperationsMap = dynamic(() => import('../components/LiveOperationsMap'), { ssr: false })

// BRAINSAIT: Manager & Admin Analytics Dashboard
// NEURAL: Executive-level business intelligence and decision support
export default function AnalyticsDashboard() {
  const router = useRouter()
  const { locale } = router
  const isRTL = locale === 'ar'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'predictive' | 'scenarios' | 'anomalies'>('overview')

  const t = {
    ar: {
      title: 'لوحة التحليلات التنفيذية - منصة SSDP',
      description: 'تحليلات متقدمة وذكاء أعمال للمدراء والإداريين',
      pageTitle: 'التحليلات التنفيذية',
      subtitle: 'ذكاء الأعمال والتحليلات التنبؤية',
      overview: 'نظرة عامة',
      predictive: 'التحليلات التنبؤية',
      scenarios: 'تخطيط السيناريوهات',
      anomalies: 'كشف الشذوذ',
      welcome: 'مرحباً في لوحة التحليلات',
      welcomeDesc: 'مركز قيادة شامل للمدراء والإداريين مع تحليلات مدعومة بالذكاء الاصطناعي',
      role: 'الدور',
      manager: 'مدير',
      lastUpdated: 'آخر تحديث',
      now: 'الآن'
    },
    en: {
      title: 'Executive Analytics Dashboard - SSDP Platform',
      description: 'Advanced analytics and business intelligence for managers and admins',
      pageTitle: 'Executive Analytics',
      subtitle: 'Business Intelligence & Predictive Analytics',
      overview: 'Overview',
      predictive: 'Predictive Analytics',
      scenarios: 'Scenario Planning',
      anomalies: 'Anomaly Detection',
      welcome: 'Welcome to Analytics Hub',
      welcomeDesc: 'Comprehensive command center for managers and admins with AI-powered insights',
      role: 'Role',
      manager: 'Manager',
      lastUpdated: 'Last Updated',
      now: 'Now'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const tabs = [
    { id: 'overview', label: text.overview },
    { id: 'predictive', label: text.predictive },
    { id: 'scenarios', label: text.scenarios },
    { id: 'anomalies', label: text.anomalies }
  ]

  return (
    <>
      <Head>
        <title>{text.title}</title>
        <meta name="description" content={text.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
          <div className="p-6">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="glass rounded-3xl p-8 saudi-pattern">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl font-bold text-white mb-2 font-cairo"
                    >
                      {text.pageTitle}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl text-white/80"
                    >
                      {text.subtitle}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="hidden md:flex items-center gap-6"
                  >
                    <div className="text-right">
                      <div className="text-sm text-white/60">{text.role}</div>
                      <div className="text-lg font-semibold text-white">{text.manager}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {text.lastUpdated}: {text.now}
                </motion.div>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <div className="flex gap-2 flex-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-orange text-white shadow-lg'
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PredictiveAnalytics locale={locale} isRTL={isRTL} />
                    <PerformanceHeatmaps locale={locale} isRTL={isRTL} />
                  </div>
                  <AnomalyDetection locale={locale} isRTL={isRTL} />
                  <LiveOperationsMap locale={locale} isRTL={isRTL} />
                </>
              )}

              {activeTab === 'predictive' && (
                <div className="space-y-6">
                  <PredictiveAnalytics locale={locale} isRTL={isRTL} />
                  <PerformanceHeatmaps locale={locale} isRTL={isRTL} />
                </div>
              )}

              {activeTab === 'scenarios' && (
                <ScenarioPlanning locale={locale} isRTL={isRTL} />
              )}

              {activeTab === 'anomalies' && (
                <AnomalyDetection locale={locale} isRTL={isRTL} />
              )}
            </motion.div>
          </div>
        </main>

        {/* AI Chatbot - Available on all tabs */}
        <AIChatbot locale={locale} isRTL={isRTL} />
      </div>
    </>
  )
}
