import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Menu, Search, Bell, Globe, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  locale?: string
  isRTL?: boolean
}

export default function Header({ onMenuClick, locale, isRTL }: HeaderProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState('light')

  const t = {
    ar: {
      search: 'البحث...',
      notifications: 'الإشعارات',
      language: 'اللغة',
      theme: 'المظهر',
      profile: 'الملف الشخصي'
    },
    en: {
      search: 'Search...',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      profile: 'Profile'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar'
    router.push(router.pathname, router.asPath, { locale: newLocale })
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20"
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div className="w-8 h-8 bg-saudi-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍯</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 font-cairo">
                {locale === 'ar' ? 'منصة توزيع الحلويات' : 'SSDP'}
              </h1>
              <p className="text-xs text-gray-500">
                {locale === 'ar' ? 'رؤية 2030' : 'Vision 2030'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Center Section - Search */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 max-w-md mx-8"
        >
          <div className="relative">
            <motion.div
              animate={{ width: searchOpen ? '100%' : '300px' }}
              className="relative"
            >
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={text.search}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
                className={`w-full bg-white/20 border border-white/30 rounded-full py-2 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={text.language}
          >
            <Globe className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={text.theme}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-gray-700" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={text.notifications}
          >
            <Bell className="w-5 h-5 text-gray-700" />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            />
          </motion.button>

          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">م</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'مدير النظام' : 'System Admin'}
              </p>
              <p className="text-xs text-gray-500">admin@ssdp.com</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vision 2030 Progress Bar */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="h-1 bg-gradient-to-r from-green-500 via-primary-500 to-secondary-900"
        style={{ transformOrigin: isRTL ? 'right' : 'left' }}
      />
    </motion.header>
  )
}
