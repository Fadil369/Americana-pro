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
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  locale?: string
  isRTL?: boolean
}

export default function Sidebar({ open, onClose, locale, isRTL }: SidebarProps) {
  const t = {
    ar: {
      dashboard: 'لوحة التحكم',
      products: 'المنتجات',
      outlets: 'المنافذ',
      orders: 'الطلبات',
      deliveries: 'التوصيل',
      analytics: 'التحليلات',
      users: 'المستخدمون',
      reports: 'التقارير',
      map: 'الخريطة',
      payments: 'المدفوعات',
      settings: 'الإعدادات',
      vision2030: 'رؤية المملكة 2030',
      digitalTransformation: 'التحول الرقمي'
    },
    en: {
      dashboard: 'Dashboard',
      products: 'Products',
      outlets: 'Outlets',
      orders: 'Orders',
      deliveries: 'Deliveries',
      analytics: 'Analytics',
      users: 'Users',
      reports: 'Reports',
      map: 'Map',
      payments: 'Payments',
      settings: 'Settings',
      vision2030: 'Saudi Vision 2030',
      digitalTransformation: 'Digital Transformation'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const menuItems = [
    { icon: Home, label: text.dashboard, href: '/', active: true },
    { icon: Package, label: text.products, href: '/products' },
    { icon: Store, label: text.outlets, href: '/outlets' },
    { icon: FileText, label: text.orders, href: '/orders' },
    { icon: Truck, label: text.deliveries, href: '/deliveries' },
    { icon: MapPin, label: text.map, href: '/map' },
    { icon: BarChart3, label: text.analytics, href: '/analytics' },
    { icon: CreditCard, label: text.payments, href: '/payments' },
    { icon: Users, label: text.users, href: '/users' },
    { icon: FileText, label: text.reports, href: '/reports' },
    { icon: Settings, label: text.settings, href: '/settings' },
  ]

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: isRTL ? 256 : -256 }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? 256 : -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-16 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-64 glass border-r border-white/20 z-50 overflow-y-auto`}
          >
            <div className="p-6">
              {/* Vision 2030 Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-500 via-primary-500 to-secondary-900 rounded-xl text-white text-center"
              >
                <div className="text-2xl mb-2">🇸🇦</div>
                <div className="text-sm font-semibold">{text.vision2030}</div>
                <div className="text-xs opacity-80 mt-1">{text.digitalTransformation}</div>
              </motion.div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all group ${
                      item.active 
                        ? 'bg-primary-500 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-white/20 hover:text-primary-600'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-gray-500 group-hover:text-primary-500'}`} />
                    <span className="font-medium">{item.label}</span>
                    
                    {item.active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full`}
                      />
                    )}
                  </motion.a>
                ))}
              </nav>

              {/* Stats Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-white/10 rounded-xl"
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {locale === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{locale === 'ar' ? 'المنافذ النشطة' : 'Active Outlets'}</span>
                    <span className="font-semibold text-primary-600">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{locale === 'ar' ? 'الطلبات اليوم' : 'Orders Today'}</span>
                    <span className="font-semibold text-green-600">89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{locale === 'ar' ? 'المركبات' : 'Vehicles'}</span>
                    <span className="font-semibold text-blue-600">24</span>
                  </div>
                </div>
              </motion.div>

              {/* Saudi Branding */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center"
              >
                <div className="text-xs text-gray-500 mb-2">
                  {locale === 'ar' ? 'صُنع بـ ❤️ في المملكة العربية السعودية' : 'Made with ❤️ in Saudi Arabia'}
                </div>
                <div className="text-xs text-gray-400">
                  BrainSAIT © 2024
                </div>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
