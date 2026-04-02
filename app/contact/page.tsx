import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { t } from '@/lib/i18n'
import Breadcrumb from '@/components/layout/Breadcrumb'
import BracketLink from '@/components/ui/BracketLink'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with AI Studio — London and Moscow offices.',
}

export default async function ContactPage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: settings } = await supabase.from('settings').select('*')
  const s = (settings || []).reduce<Record<string, string>>(
    (acc, item) => { acc[item.key] = item.value; return acc },
    {}
  )

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('contact', lang) }]} lang={lang} />
      <h1 className="page-title mb-12">{t('contact', lang)}</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        <div>
          <h2 className="text-nav uppercase tracking-wide-nav text-ink mb-4">London</h2>
          <p className="text-body mb-1">{s.london_address || '79-89 Lots Road SW10 0RN, London, UK'}</p>
          <p className="text-body-sm text-muted">T {s.london_phone || '+44 207 971 1227'}</p>
        </div>
        <div>
          <h2 className="text-nav uppercase tracking-wide-nav text-ink mb-4">Moscow</h2>
          <p className="text-body mb-1">{s.moscow_address || "6 Novaya Ploshad' 109012 Moscow, Russia"}</p>
          <p className="text-body-sm text-muted">T {s.moscow_phone || '+7 495 790 7776'}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <a
          href={`mailto:${s.email || 'office@aistudio.co.uk'}`}
          className="text-accent hover:text-accent/80 transition-colors duration-300 text-body"
        >
          {s.email || 'office@aistudio.co.uk'}
        </a>
        <div className="flex gap-4">
          <BracketLink href={s.telegram_url || 'https://t.me/'} external>Telegram</BracketLink>
          <BracketLink href={s.linkedin_url || 'https://linkedin.com/'} external>LinkedIn</BracketLink>
        </div>
      </div>
    </>
  )
}
