import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import { SiteContent } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import BracketLink from '@/components/ui/BracketLink'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'About AI Studio — international architecture, design and urbanism practice.',
}

export default async function StudioPage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('page_key', ['about', 'founder'])

  const contentMap = (content || []).reduce<Record<string, SiteContent>>(
    (acc, item) => {
      acc[item.page_key] = item
      return acc
    },
    {}
  )

  const { data: settings } = await supabase.from('settings').select('*')
  const settingsMap = (settings || []).reduce<Record<string, string>>(
    (acc, item) => {
      acc[item.key] = item.value
      return acc
    },
    {}
  )

  const defaultAboutText = `AI Studio is an international practice that works across architecture, urbanism, and interior design. The studio develops contemporary, context-driven projects, ranging from private residences to large-scale, mixed-use and urban developments. Its work is defined by a strong clarity of concept, spatial precision, and a commitment to exceptional quality.\nToday, AI Studio operates globally, collaborating with developers, consultants, and cultural institutions across Europe, the UK, the Middle East, Asia, and the Americas. Each project begins with a careful reading of its physical and cultural context, ensuring that their contemporary designs are deeply rooted in unique architectural settings.`

  const defaultFounderText = `AI Studio is an international practice that works across architecture, urbanism, and interior design. The studio develops contemporary, context-driven projects, ranging from private residences to large-scale, mixed-use and urban developments. Its work is defined by a strong clarity of concept, spatial precision, and a commitment to exceptional quality.\nToday, AI Studio operates globally, collaborating with developers, consultants, and cultural institutions across Europe, the UK, the Middle East, Asia, and the Americas. Each project begins with a careful reading of its physical and cultural context, ensuring that their contemporary designs are deeply rooted in unique architectural settings.`

  const aboutText = contentMap.about ? getField(contentMap.about, 'content', lang) || defaultAboutText : defaultAboutText
  const founderText = contentMap.founder ? getField(contentMap.founder, 'content', lang) || defaultFounderText : defaultFounderText

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('about', lang) }]} lang={lang} />

      <div className="mb-12">
        <h1 className="text-[2.5rem] lg:text-[3rem] font-light leading-[1.1]">
          ai studio
        </h1>
        <div className="text-[1.4rem] lg:text-[1.8rem] font-light text-muted leading-[1.3] mt-1">
          <div>architecture</div>
          <div>design</div>
          <div>urbanism</div>
        </div>
      </div>

      <div className="divider mb-12" />

      <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
        <div className="lg:w-[200px] shrink-0">
          <h2 className="section-label">{t('about', lang)}</h2>
        </div>
        <div className="flex-1">
          <div className="text-body text-ink/90 whitespace-pre-line max-w-[600px]">
            {aboutText}
          </div>
          <div className="mt-6">
            <BracketLink href="/news">{t('studio_news', lang)}</BracketLink>
          </div>
        </div>
      </section>

      <div className="divider mb-12" />

      <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
        <div className="lg:w-[200px] shrink-0">
          <h2 className="section-label">{t('founder', lang)}</h2>
        </div>
        <div className="flex-1">
          <div className="text-body text-ink/90 whitespace-pre-line max-w-[600px]">
            {founderText}
          </div>
        </div>
      </section>

      <div className="divider mb-12" />

      <section className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="lg:w-[200px] shrink-0">
          <h2 className="section-label">{t('get_in_touch', lang)}</h2>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-12">
            <div>
              <p className="text-body">{settingsMap.london_address || '79-89 Lots Road SW10 0RN, London, UK'}</p>
              <p className="text-body-sm text-muted mt-1">T {settingsMap.london_phone || '+44 207 971 1227'}</p>
            </div>
            <div>
              <p className="text-body">{settingsMap.moscow_address || "6 Novaya Ploshad' 109012 Moscow, Russia"}</p>
              <p className="text-body-sm text-muted mt-1">T {settingsMap.moscow_phone || '+7 495 790 7776'}</p>
            </div>
          </div>
          <div className="mt-6">
            <BracketLink href={`mailto:${settingsMap.email || 'office@aistudio.co.uk'}`}>
              {(settingsMap.email || 'office@aistudio.co.uk').toUpperCase()}
            </BracketLink>
          </div>
        </div>
      </section>
    </>
  )
}
