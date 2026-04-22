import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { PressItem } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import PressFilter from '@/components/ui/PressFilter'

export const metadata: Metadata = {
  title: 'Press',
  description: 'AI Studio in the press — media coverage, interviews, and awards.',
  openGraph: {
    title: 'Press — AI Studio',
    description: 'AI Studio in the press — media coverage, interviews, and awards.',
  },
}

export default async function PressPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: items } = await supabase
    .from('press')
    .select('*')
    .order('date', { ascending: false })

  const pressItems = (items as PressItem[]) || []

  const projectIds = [...new Set(
    pressItems.map((i) => i.project_id).filter((id): id is string => id !== null)
  )]
  let projectSlugs: Record<string, string> = {}
  if (projectIds.length > 0) {
    const { data: projs } = await supabase
      .from('projects')
      .select('id, slug')
      .in('id', projectIds)
    if (projs) projectSlugs = Object.fromEntries(projs.map((p) => [p.id, p.slug]))
  }

  return (
    <div className="lg:max-w-[80%]">
      <Breadcrumb crumbs={[{ label: t('press', lang) }]} lang={lang} />
      <h1 className="page-title mb-8">{t('press', lang)}</h1>
      <PressFilter
        items={pressItems}
        lang={lang}
        initialCategory={searchParams.category}
        projectSlugs={projectSlugs}
      />
    </div>
  )
}
