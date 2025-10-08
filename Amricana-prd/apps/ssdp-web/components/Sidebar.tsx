import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Package,
  Store,
  Truck,
  BarChart3,
  Users,
  Settings,
  FileText,
  MapPin,
  CreditCard,
  Sparkles
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  locale?: string
  isRTL?: boolean
}

const labels = {
  ar: {
    dashboard: 'لوحة القيادة',
    products: 'المنتجات',
    outlets: 'المنافذ',
    orders: 'الطلبات',
    deliveries: 'الأسطول',
    analytics: 'التحليلات',
    users: 'الهوية الرقمية',
    reports: 'التقارير',
    map: 'الخريطة المباشرة',
    payments: 'المدفوعات',
    settings: 'الإعدادات',
    academy: 'أكاديمية BrainSAIT',
    quickStats: 'مؤشرات دقيقة',
    madeIn: 'صُنع في المملكة العربية السعودية',
    inc: 'BrainSAIT © 2025'
  },
  en: {
    dashboard: 'Command Hub',
    products: 'Product Catalog',
    outlets: 'Outlet Network',
    orders: 'Order Flow',
    deliveries: 'Fleet Ops',
    analytics: 'Analytics',
    users: 'Digital Identity',
    reports: 'Reports',
    map: 'Live Map',
    payments: 'Payments',
    settings: 'Settings',
    academy: 'BrainSAIT Academy',
    quickStats: 'Quick Signals',
    madeIn: 'Made in Saudi Arabia',
    inc: 'BrainSAIT © 2025'
  }
}

export default function Sidebar({ open, onClose, locale, isRTL }: SidebarProps) {
  const dictionary = labels[(locale as keyof typeof labels) || 'ar']

  const menuItems = [
    { icon: Home, label: dictionary.dashboard, href: '/', badge: 'Live', active: true },
    { icon: Package, label: dictionary.products, href: '/products' },
    { icon: Store, label: dictionary.outlets, href: '/outlets' },
    { icon: FileText, label: dictionary.orders, href: '/orders' },
    { icon: Truck, label: dictionary.deliveries, href: '/deliveries' },
    { icon: MapPin, label: dictionary.map, href: '/map' },
    { icon: BarChart3, label: dictionary.analytics, href: '/analytics' },
    { icon: CreditCard, label: dictionary.payments, href: '/payments' },
    { icon: Users, label: dictionary.users, href: '/users' },
    { icon: Settings, label: dictionary.settings, href: '/settings' }
  ]

  const stats = [
    { label: locale === 'ar' ? 'المنافذ النشطة' : 'Active Outlets', value: '1,284', tone: 'text-accent-teal' },
    { label: locale === 'ar' ? 'الطلبات اليوم' : 'Orders Today', value: '96', tone: 'text-brand-orange' },
    { label: locale === 'ar' ? 'متوسط زمن التوصيل' : 'Avg Delivery', value: '27m', tone: 'text-accent-blue' }
  ]

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-brand-navySoft/60 p-5 text-white shadow-card"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/20 text-2xl">
            🇸🇦
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">2030</p>
            <h2 className="font-display text-lg font-semibold text-white">Vision Impact</h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-white/70">
          {locale === 'ar'
            ? 'رحلة التحول الرقمي لقطاع التوزيع في المملكة العربية السعودية.'
            : 'Digital transformation for Saudi distribution supply chains.'}
        </p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-brand-orange/40 bg-brand-orange/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-orange transition hover:bg-brand-orange/20">
          <Sparkles className="h-4 w-4" />
          {dictionary.academy}
        </button>
      </motion.div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.a
            key={item.href}
            href={item.href}
            initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            className={`group relative flex items-center justify-between gap-3 rounded-2xl border border-white/5 px-4 py-3 text-sm font-medium text-white/70 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white ${
              item.active ? 'border-brand-orange/40 bg-brand-orange/15 text-white shadow-card' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <item.icon className={`h-4 w-4 ${item.active ? 'text-brand-orange' : 'text-white/60 group-hover:text-brand-orange'}`} />
              {item.label}
            </span>
            {item.badge && (
              <span className="rounded-full bg-brand-orange/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">
                {item.badge}
              </span>
            )}
          </motion.a>
        ))}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/5 bg-white/5 p-5 text-white/80"
      >
        <h4 className="text-xs uppercase tracking-[0.28em] text-white/50">{dictionary.quickStats}</h4>
        <div className="mt-4 space-y-3">
          {stats.map(stat => (
            <div key={stat.label} className="flex items-center justify-between text-sm">
              <span>{stat.label}</span>
              <span className={`font-semibold ${stat.tone}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-auto space-y-2 text-center text-xs text-white/40">
        <p>{dictionary.madeIn}</p>
        <p>{dictionary.inc}</p>
      </div>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar-mobile"
            initial={{ x: isRTL ? 320 : -320 }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? 320 : -320 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className={`fixed top-[120px] ${isRTL ? 'right-0' : 'left-0'} z-50 h-[calc(100vh-120px)] w-72 overflow-hidden rounded-3xl border border-white/10 bg-brand-navy/95 shadow-glow lg:hidden`}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className={`noscroll pointer-events-none hidden h-[calc(100vh-120px)] w-72 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-brand-navy/85 shadow-card lg:pointer-events-auto lg:block ${isRTL ? 'ml-6' : 'mr-6'}`}>
        {sidebarContent}
      </aside>
    </>
  )
}
