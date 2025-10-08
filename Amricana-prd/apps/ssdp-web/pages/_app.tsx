// BILINGUAL: Main app component with i18n support
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import '../styles/globals.css'
import '../i18n' // Initialize i18n

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // BILINGUAL: Set document direction based on locale
    const isRTL = router.locale === 'ar'
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = router.locale || 'ar'
    
    // Set theme color meta tag for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#1a365d') // Royal Midnight
    }
  }, [router.locale])

  return <Component {...pageProps} />
}
