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

  return (
    <div className="lg:max-w-[80%]">
      <Breadcrumb crumbs={[{ label: t('press', lang) }]} lang={lang} />
      <h1 className="page-title mb-8">{t('press', lang)}</h1>
      <PressFilter
        items={(items as PressItem[]) || []}
        lang={lang}
        initialCategory={searchParams.category}
      />
    </div>
  )
}
