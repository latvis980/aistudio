// app/(public)/layout.tsx

import { cookies } from 'next/headers'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import CookieBanner from '@/components/layout/CookieBanner'
import { getLangFromCookies } from '@/lib/utils'
import { isRTL } from '@/lib/i18n'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const rtl = isRTL(lang)

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      {/* Sidebar — fixed on desktop, hamburger on mobile */}
      <Sidebar lang={lang} />

      {/* Language switcher — fixed top-right */}
      <div className="hidden lg:block fixed top-8 end-8 z-50">
        <LanguageSwitcher currentLang={lang} />
      </div>

      {/* Main content area */}
      <main className="content-area px-6 lg:ps-content-px lg:pe-sidebar pt-28 lg:pt-12 pb-8 min-h-screen">
        {children}
        <Footer lang={lang} />
      </main>
      <CookieBanner lang={lang} />
    </div>
  )
}
