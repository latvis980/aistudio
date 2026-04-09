import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { Project } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import WorksFilter from '@/components/ui/WorksFilter'

export const metadata: Metadata = {
  title: 'Works',
  description: 'Architecture, design and urbanism projects by AI Studio.',
  openGraph: {
    title: 'Works — AI Studio',
    description: 'Architecture, design and urbanism projects by AI Studio.',
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
      <h1 className="page-title mb-8">{t('works', lang)}</h1>
      <WorksFilter
        projects={(projects as Project[]) || []}
        lang={lang}
        initialTypology={searchParams.typology}
      />
    </>
  )
}
