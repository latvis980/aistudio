import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { NewsItem as NewsItemType } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import NewsList from '@/components/ui/NewsList'

export const metadata: Metadata = {
  title: 'Studio News',
  description: 'Latest studio news and updates from AI Studio.',
}

export default async function NewsPage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: items } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('studio_news', lang) }]} lang={lang} />
      <h1 className="page-title mb-8">{t('studio_news', lang)}</h1>
      <NewsList items={(items as NewsItemType[]) || []} lang={lang} />
    </>
  )
}
