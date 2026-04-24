'use client'

// components/layout/CookieBanner.tsx

import { useState, useEffect } from 'react'
import { getCookie, setCookie } from 'cookies-next'
import Link from 'next/link'
import { Lang } from '@/lib/types'
import { t } from '@/lib/i18n'

interface CookieBannerProps {
  lang: Lang
}

export default function CookieBanner({ lang }: CookieBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getCookie('cookie_consent')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    setCookie('cookie_consent', 'true', { maxAge: 60 * 60 * 24 * 365, path: '/' })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 start-0 end-0 z-50 border-t border-border bg-cream/95 backdrop-blur-sm">
      <div className="px-6 lg:ps-content-px lg:pe-content-px-end py-3 flex items-center justify-between gap-4">
        <p className="text-body-sm text-muted">
          {t('cookie_banner_text', lang)}{' '}
          <Link
            href="/cookie-policy"
            className="text-accent hover:text-accent/80 transition-colors duration-300 underline underline-offset-2"
          >
            {t('cookie_policy', lang)}
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 text-nav uppercase tracking-wide-nav text-ink hover:text-accent transition-colors duration-300"
        >
          {t('cookie_banner_accept', lang)}
        </button>
      </div>
    </div>
  )
}
