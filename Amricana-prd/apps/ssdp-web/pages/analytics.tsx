// BRAINSAIT: Analytics page with roadmap and KPI tracking
// NEURAL: Glass morphism design with bilingual support
// BILINGUAL: Complete Arabic/English support with RTL

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import RoadmapTracker from '../components/RoadmapTracker'
import KPIDashboard from '../components/KPIDashboard'
import { motion } from 'framer-motion'
import { RoadmapData, KPIData } from '../types/dashboard'
import { BarChart3, TrendingUp } from 'lucide-react'

export default function Analytics() {
  const router = useRouter()
  const { locale } = router
  const isRTL = locale === 'ar'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [kpiData, setKPIData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  const t = {
    ar: {
      title: 'التحليلات والمقاييس - منصة توزيع الحلويات الذكية',
      description: 'خارطة طريق التنفيذ ومؤشرات الأداء الرئيسية',
      pageTitle: 'التحليلات والمقاييس',
      subtitle: 'تتبع التقدم ومؤشرات الأداء الرئيسية',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل البيانات'
    },
    en: {
      title: 'Analytics & Metrics - Smart Sweet Distribution Platform',
      description: 'Implementation roadmap and key performance indicators',
      pageTitle: 'Analytics & Metrics',
      subtitle: 'Track progress and key performance indicators',
      loading: 'Loading...',
      error: 'Error loading data'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch roadmap data
        const roadmapResponse = await fetch('https://ssdp-api.dr-mf-12298.workers.dev/api/analytics/roadmap')
        const roadmapResult = await roadmapResponse.json()
        if (roadmapResult.success) {
          setRoadmapData(roadmapResult.data)
        }

        // Fetch KPI data
        const kpiResponse = await fetch('https://ssdp-api.dr-mf-12298.workers.dev/api/analytics/kpi')
        const kpiResult = await kpiResponse.json()
        if (kpiResult.success) {
          setKPIData(kpiResult.data)
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
            {/* Page Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="glass rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{text.pageTitle}</h1>
                    <p className="text-gray-600">{text.subtitle}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="glass rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                <p className="text-gray-600">{text.loading}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Roadmap Section */}
                {roadmapData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <RoadmapTracker 
                      data={roadmapData}
                      locale={locale}
                      isRTL={isRTL}
                    />
                  </motion.div>
                )}

                {/* KPI Section */}
                {kpiData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <KPIDashboard 
                      data={kpiData}
                      locale={locale}
                      isRTL={isRTL}
                    />
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
