import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Menu, Search, Bell, Globe, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  locale?: string
  isRTL?: boolean
}

type ThemeMode = 'light' | 'dark'

const translations = {
  ar: {
    search: 'ابحث عن المقاييس، العملاء أو المناطق...',
    notifications: 'الإشعارات',
    language: 'تغيير اللغة',
    theme: 'تبديل المظهر',
    profile: 'الملف الشخصي',
    commandCenter: 'مركز قيادة BrainSAIT',
    strapline: 'ذكاء التوزيع السعودي في الزمن الحقيقي',
    uptime: 'جاهزية الأنظمة',
    compliance: 'التوافق الضريبي',
    fraud: 'مراقبة الاحتيال',
    sla: 'اتفاقيات الخدمة',
    live: 'مباشر',
    viewAlerts: 'عرض التنبيهات'
  },
  en: {
    search: 'Search metrics, customers or regions…',
    notifications: 'Notifications',
    language: 'Switch language',
    theme: 'Toggle theme',
    profile: 'Profile',
    commandCenter: 'BrainSAIT Command Center',
    strapline: 'Real-time Saudi distribution intelligence',
    uptime: 'System Uptime',
    compliance: 'Compliance',
    fraud: 'Fraud Watch',
    sla: 'Service SLAs',
    live: 'Live',
    viewAlerts: 'View alerts'
  }
}

export default function Header({ onMenuClick, locale, isRTL }: HeaderProps) {
  const router = useRouter()
  const activeLocale = (locale as keyof typeof translations) || 'ar'
  const text = translations[activeLocale]
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = (localStorage.getItem('brainsait-theme') as ThemeMode | null) || 'dark'
    setTheme(stored)
    document.documentElement.classList.toggle('dark', stored === 'dark')
    document.documentElement.dataset.theme = stored
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    localStorage.setItem('brainsait-theme', theme)
  }, [theme, mounted])

  const toggleLanguage = () => {
    const newLocale = activeLocale === 'ar' ? 'en' : 'ar'
    router.push(router.pathname, router.asPath, { locale: newLocale })
  }

  const toggleTheme = () => {
    setTheme((prev: ThemeMode) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const statusChips = [
    {
      id: 'uptime',
      label: text.uptime,
      value: '99.98%',
      tone: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/30'
    },
    {
      id: 'compliance',
      label: text.compliance,
      value: 'PDPL · VAT 15%',
      tone: 'text-sky-300 bg-sky-500/10 border border-sky-400/30'
    },
    {
      id: 'fraud',
      label: text.fraud,
      value: '2 anomalies',
      tone: 'text-amber-300 bg-amber-500/10 border border-amber-400/30'
    },
    {
      id: 'sla',
      label: text.sla,
      value: '4m response',
      tone: 'text-brand-orange bg-brand-orange/10 border border-brand-orange/30'
    }
  ]

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-brand-graphite/85 backdrop-blur-2xl shadow-[0_20px_48px_-24px_rgba(4,10,22,0.85)]"
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:border-white/30 hover:bg-white/10 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-orange/15 text-2xl">
                <span role="img" aria-label="BrainSAIT spark">⚡</span>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-xs font-semibold text-white shadow-lg">
                  {text.live}
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.32em] text-white/50">
                  BrainSAIT
                </p>
                <h1 className="font-display text-lg font-semibold text-white sm:text-xl">
                  {text.commandCenter}
                </h1>
                <p className="text-xs text-white/60 sm:text-sm">
                  {text.strapline}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden flex-1 items-center justify-center md:flex"
          >
            <div className="relative w-full max-w-xl">
              <Search className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="search"
                placeholder={text.search}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
                className={`h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition-[border,background] focus:border-brand-orange focus:bg-white/10 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              />
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: searchOpen ? 1 : 0, y: searchOpen ? 0 : -6 }}
                className={`absolute top-full mt-2 text-xs text-white/60 ${isRTL ? 'right-2' : 'left-2'}`}
              >
                cmd ⌘ + K
              </motion.span>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleLanguage}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-white/30 hover:bg-white/10"
              title={text.language}
            >
              <Globe className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-white/30 hover:bg-white/10"
              title={text.theme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-brand-orange/40 hover:bg-brand-orange/10"
              title={text.notifications}
            >
              <Bell className="h-5 w-5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-semibold text-white"
              >
                4
              </motion.span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white transition hover:border-white/30 hover:bg-white/10 sm:flex"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange text-lg font-semibold">
                م
              </div>
              <div className="leading-tight">
                <p className="text-xs text-white/60">BrainSAIT ID</p>
                <p className="text-sm font-semibold">admin@brainsait.com</p>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {statusChips.map(status => (
            <motion.div
              key={status.id}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs font-medium uppercase tracking-wide ${status.tone}`}
            >
              <span>{status.label}</span>
              <span>{status.value}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2 }}
        className="h-[2px] bg-gradient-to-r from-brand-orange via-accent-blue to-accent-teal"
        style={{ transformOrigin: isRTL ? 'right' : 'left' }}
      />
    </motion.header>
  )
}
