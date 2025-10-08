import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import StatsCards from '../components/StatsCards'
import SalesChart from '../components/SalesChart'
import LiveOperationsMap from '../components/LiveOperationsMap'
import { useDashboardData } from '../hooks/useDashboardData'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const router = useRouter()
  const { locale } = router
  const isRTL = locale === 'ar'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { data, loading, error, refetch } = useDashboardData()

  const t = {
    ar: {
      title: 'منصة توزيع الحلويات الذكية',
      description: 'لوحة التحكم الرئيسية لإدارة توزيع الحلويات في المملكة العربية السعودية',
      dashboard: 'لوحة التحكم',
      welcome: 'مرحباً بك في منصة توزيع الحلويات الذكية',
      subtitle: 'تمكين سوق توزيع الحلويات في المملكة العربية السعودية',
      vision2030: 'رؤية المملكة 2030',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل البيانات',
      retry: 'إعادة المحاولة'
    },
    en: {
      title: 'Smart Sweet Distribution Platform',
      description: 'Main dashboard for managing sweet distribution in Saudi Arabia',
      dashboard: 'Dashboard',
      welcome: 'Welcome to Smart Sweet Distribution Platform',
      subtitle: 'Empowering Saudi Arabia\'s sweet distribution market',
      vision2030: 'Saudi Vision 2030',
      loading: 'Loading...',
      error: 'Error loading data',
      retry: 'Retry'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  return (
    <>
      <Head>
        <title>{text.title}</title>
        <meta name="description" content={text.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" as="style" />
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
              <div className="glass rounded-2xl p-8 saudi-pattern">
                <div className="text-center text-white">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-bold mb-4 font-cairo"
                  >
                    {text.welcome}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl opacity-90 mb-6"
                  >
                    {text.subtitle}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full text-sm font-medium"
                  >
                    🇸🇦 {text.vision2030}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="text-lg font-medium text-gray-600">{text.loading}</span>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-red-800 mb-2">{text.error}</h3>
                  <button 
                    onClick={refetch}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {text.retry}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Dashboard Content */}
            {data && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <StatsCards data={data} locale={locale} isRTL={isRTL} />

                {/* Charts and Map Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Chart */}
                  <motion.div 
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <SalesChart data={data.sales_trend} locale={locale} isRTL={isRTL} />
                  </motion.div>

                  {/* Operations Map */}
                  <motion.div 
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <LiveOperationsMap locale={locale} isRTL={isRTL} />
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-xl p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                  </h3>
                  <div className="space-y-3">
                    {data.top_products?.map((product, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{product.sales} {locale === 'ar' ? 'مبيعات' : 'sales'}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
