import './globals.css'
import { cookies } from 'next/headers'
import { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import { getLangFromCookies } from '@/lib/utils'
import { isRTL } from '@/lib/i18n'

export const metadata: Metadata = {
  title: {
    default: 'AI Studio — Architecture, Design, Urbanism',
    template: '%s — AI Studio',
  },
  description:
    'AI Studio is an international architecture, design and urbanism practice based in London and Moscow.',
  metadataBase: new URL('https://aistudio.co.uk'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    type: 'website',
    siteName: 'AI Studio',
    locale: 'en_GB',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const rtl = isRTL(lang)

  return (
    <html lang={lang} dir={rtl ? 'rtl' : 'ltr'}>
      <body>
        {/* Sidebar — fixed on desktop, hamburger on mobile */}
        <Sidebar lang={lang} />

        {/* Language switcher — fixed top-right */}
        <div className="fixed top-8 end-8 z-50">
          <LanguageSwitcher currentLang={lang} />
        </div>

        {/* Main content area */}
        <main className="content-area px-6 lg:ps-content-px lg:pe-content-px-end pt-8 lg:pt-12 pb-8 min-h-screen">
          {children}
          <Footer lang={lang} />
        </main>
      </body>
    </html>
  )
}