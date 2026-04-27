// app/(public)/works/page.tsx

import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { Project } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import WorksFilter from '@/components/ui/WorksFilter'
import AnimatedEntry from '@/components/ui/AnimatedEntry'

export const metadata: Metadata = {
  title: 'Works',
  description: 'Architecture, design and urbanism projects by ai studio.',
  openGraph: {
    title: 'Works — ai studio',
    description: 'Architecture, design and urbanism projects by ai studio.',
  },
}

export default async function WorksPage({
  searchParams,
}: {
  searchParams: { typology?: string }
}) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('works', lang) }]} lang={lang} />
      <AnimatedEntry>
        <h1 className="page-title mb-8">{t('works', lang)}</h1>
      </AnimatedEntry>
      <AnimatedEntry delay={0.15}>
        <WorksFilter
          projects={(projects as Project[]) || []}
          lang={lang}
          initialTypology={searchParams.typology}
        />
      </AnimatedEntry>
    </>
  )
}
