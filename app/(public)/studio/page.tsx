// app/(public)/studio/page.tsx

import Image from 'next/image'
import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import { translateText } from '@/lib/translateText'
import { SiteContent } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import BracketLink from '@/components/ui/BracketLink'
import AnimatedEntry from '@/components/ui/AnimatedEntry'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'About ai studio — international architecture, design and urbanism practice.',
  openGraph: {
    title: 'Studio — ai studio',
    description: 'About ai studio — international architecture, design and urbanism practice.',
    images: ['/aistudio.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/aistudio.png'],
  },
}

export default async function StudioPage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('page_key', ['about', 'founder', 'adu_media'])

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

  // ── Per-language phone resolution ──────────────────────────────────────────
  // Priority: language-specific key → catch-all key → hardcoded fallback
  const londonPhone =
    settingsMap[`london_phone_${lang}`] ||
    settingsMap.london_phone ||
    null

  const moscowPhone =
    settingsMap[`moscow_phone_${lang}`] ||
    settingsMap.moscow_phone ||
    null
  // ───────────────────────────────────────────────────────────────────────────

  const rawMoscowAddress = settingsMap.moscow_address || "6 Novaya Ploshad' 109012 Moscow, Russia"
  const moscowAddress =
    lang === 'ar' || lang === 'zh'
      ? await translateText(rawMoscowAddress, lang)
      : rawMoscowAddress

  const aboutText = contentMap.about ? getField(contentMap.about, 'content', lang) : ''
  const founderText = contentMap.founder ? getField(contentMap.founder, 'content', lang) : ''
  const aduMediaText = contentMap.adu_media ? getField(contentMap.adu_media, 'content', lang) : ''

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('studio', lang) }]} lang={lang} />

      <AnimatedEntry>
        <div className="mb-12">
          <h1 className="text-[4rem] lg:text-[5.4rem] font-light leading-[1.1]">
            ai studio
          </h1>
          <div className="text-[2.3rem] lg:text-[3.1rem] font-light text-muted leading-[1.3] mt-1">
            <div>architecture</div>
            <div>design</div>
            <div>urbanism</div>
          </div>
        </div>
      </AnimatedEntry>

      <AnimatedEntry delay={0.1}>
        <div className="divider mb-12" />

        <section id="about" className="scroll-mt-24 flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
          <div className="lg:w-[200px] shrink-0">
            <h2 className="section-label">{t('about', lang)}</h2>
          </div>
          <div className="flex-1">
            <div className="text-body text-ink/90 whitespace-pre-line max-w-[700px]">
              {aboutText}
            </div>
            <div className="mt-6">
              <BracketLink href="/news">{t('studio_news', lang)}</BracketLink>
            </div>
          </div>
        </section>
      </AnimatedEntry>

      <AnimatedEntry delay={0.2}>
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
      </AnimatedEntry>

      <AnimatedEntry delay={0.3}>
        <div className="divider mb-12" />

        <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
          <div className="lg:w-[200px] shrink-0">
            <h2 className="section-label">{t('adu_media', lang)}</h2>
            <Image
              src="/images/logo-adu.png"
              alt="a/d/u media"
              width={540}
              height={540}
              className="w-12 h-12 rounded-sm mt-3"
            />
          </div>
          <div className="flex-1">
            <div className="text-body text-ink/90 whitespace-pre-line max-w-[600px]">
              {aduMediaText}
            </div>
            <div className="mt-6">
              <BracketLink href="https://adu.media" external>adu.media</BracketLink>
            </div>
          </div>
        </section>
      </AnimatedEntry>

      <AnimatedEntry delay={0.4}>
        <div className="divider mb-12" />

        <section id="get-in-touch" className="flex flex-col lg:flex-row gap-8 lg:gap-16 scroll-mt-24">
          <div className="lg:w-[200px] shrink-0">
            <h2 className="section-label">{t('get_in_touch', lang)}</h2>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-12">
              {/* London office — always shown */}
              <div>
                <p className="text-body">
                  {settingsMap.london_address || '79-89 Lots Road SW10 0RN, London, UK'}
                </p>
                {londonPhone && <p className="text-body-sm text-muted mt-1">T {londonPhone}</p>}
              </div>

              {/* Moscow / regional office — shown for RU, ZH, AR */}
              {(['ru', 'zh', 'ar'] as string[]).includes(lang) && (
                <div>
                  <p className="text-body">{moscowAddress}</p>
                  {moscowPhone && <p className="text-body-sm text-muted mt-1">T {moscowPhone}</p>}
                </div>
              )}
            </div>
            <div className="mt-6">
              <BracketLink href={`mailto:${settingsMap.email || 'office@aistudio.co.uk'}`}>
                {(settingsMap.email || 'office@aistudio.co.uk').toUpperCase()}
              </BracketLink>
            </div>
          </div>
        </section>

        <div className="mt-12">
          <p className="text-body-sm text-muted mb-4">ai studio london</p>
          <div className="aspect-video relative">
            <Image
              src="/aistudio-london.jpg"
              alt="ai studio london"
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
              priority
            />
            {/* <video
              src="/aistudio.mp4"
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            /> */}
          </div>
        </div>
      </AnimatedEntry>
    </>
  )
}