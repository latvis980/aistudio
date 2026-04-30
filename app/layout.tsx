// app/layout.tsx

import './globals.css'
import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { getLangFromCookies } from '@/lib/utils'
import { isRTL } from '@/lib/i18n'

export const metadata: Metadata = {
  title: {
    default: 'ai studio — Architecture, Design, Urbanism',
    template: '%s — ai studio',
  },
  description:
    'ai studio is an international architecture, design and urbanism practice based in London and Moscow.',
  metadataBase: new URL('https://aistudio.co.uk'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'ai studio',
    locale: 'en_GB',
    images: ['/aistudio.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/aistudio.png'],
  },
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://aistudio.co.uk/#organization',
  name: 'ai studio',
  alternateName: 'AI Studio',
  legalName: 'ai international ltd',
  url: 'https://aistudio.co.uk',
  email: 'office@aistudio.co.uk',
  description:
    'ai studio is an international, multi-disciplinary architecture, design and urbanism practice with offices in London and Moscow.',
  logo: 'https://aistudio.co.uk/web-app-manifest-512x512.png',
  image: 'https://aistudio.co.uk/aistudio.png',
  foundingDate: '2018',
  founder: {
    '@type': 'Person',
    name: 'Anton Khmelnitskiy',
    jobTitle: 'Founder & Principal',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Moscow Architectural Institute' },
  },
  knowsAbout: [
    'Architecture',
    'Urbanism',
    'Master planning',
    'Interior design',
    'Hospitality design',
    'Mixed-use development',
    'Residential design',
    'Public buildings',
  ],
  knowsLanguage: ['en', 'ru', 'ar', 'zh', 'es'],
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: '79–89 Lots Road',
      addressLocality: 'London',
      postalCode: 'SW10 0RN',
      addressCountry: 'GB',
    },
    {
      '@type': 'PostalAddress',
      streetAddress: "6 Novaya Ploshad'",
      addressLocality: 'Moscow',
      postalCode: '109012',
      addressCountry: 'RU',
    },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'general enquiries',
      email: 'office@aistudio.co.uk',
      availableLanguage: ['English', 'Russian', 'Arabic', 'Chinese', 'Spanish'],
    },
  ],
  sameAs: [
    'https://www.linkedin.com/company/aistudioprofile/',
    'https://t.me/a_d_u_media',
    'https://adu.media',
  ],
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://aistudio.co.uk/#website',
  url: 'https://aistudio.co.uk',
  name: 'ai studio',
  publisher: { '@id': 'https://aistudio.co.uk/#organization' },
  inLanguage: ['en-GB', 'ru-RU', 'ar', 'zh', 'es'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        {children}
      </body>
    </html>
  )
}