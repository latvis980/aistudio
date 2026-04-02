import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import { JournalItem } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import JournalFeed from './JournalFeed'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Latest updates from AI Studio — news, press coverage, and new projects.',
}

export default async function JournalPage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const [newsRes, pressRes, projectsRes] = await Promise.all([
    supabase
      .from('news')
      .select('slug, date, title_en, title_ru, title_ar, title_zh, title_es, description_en, description_ru, description_ar, description_zh, description_es, cover_image, source')
      .eq('show_in_journal', true),
    supabase
      .from('press')
      .select('slug, date, title_en, title_ru, title_ar, title_zh, title_es, description_en, description_ru, description_ar, description_zh, description_es, cover_image, publication_name, category')
      .eq('show_in_journal', true),
    supabase
      .from('projects')
      .select('slug, title_en, title_ru, title_ar, title_zh, title_es, description_en, description_ru, description_ar, description_zh, description_es, cover_image, typology, created_at')
      .eq('show_in_journal', true),
  ])

  const feed: JournalItem[] = []

  for (const item of newsRes.data || []) {
    feed.push({
      type: 'news',
      slug: item.slug,
      date: item.date,
      title: getField(item, 'title', lang),
      description: getField(item, 'description', lang),
      cover_image: item.cover_image,
      label: item.source || 'Studio News',
    })
  }

  for (const item of pressRes.data || []) {
    feed.push({
      type: 'press',
      slug: item.slug,
      date: item.date,
      title: getField(item, 'title', lang),
      description: getField(item, 'description', lang),
      cover_image: item.cover_image,
      label: item.publication_name || '',
      category: item.category,
    })
  }

  for (const item of projectsRes.data || []) {
    feed.push({
      type: 'works',
      slug: item.slug,
      date: item.created_at?.split('T')[0] || null,
      title: getField(item, 'title', lang),
      description: getField(item, 'description', lang),
      cover_image: item.cover_image,
      label: item.typology,
    })
  }

  feed.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('journal', lang) }]} lang={lang} />
      <h1 className="page-title mb-8">{t('journal', lang)}</h1>
      <JournalFeed items={feed} lang={lang} />
    </>
  )
}
