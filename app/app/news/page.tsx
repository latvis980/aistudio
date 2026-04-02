import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { NewsItem as NewsItemType } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import NewsItemCard from '@/components/ui/NewsItem'

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news and updates from AI Studio.',
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
      <Breadcrumb crumbs={[{ label: t('news', lang) }]} lang={lang} />
      <h1 className="page-title mb-8">{t('news', lang)}</h1>
      <div>
        {((items as NewsItemType[]) || []).map((item) => (
          <NewsItemCard key={item.id} item={item} lang={lang} />
        ))}
      </div>
    </>
  )
}
