// app/(public)/page.tsx

import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { getField } from '@/lib/i18n'
import { Project, SiteContent } from '@/lib/types'
import Hero from '@/components/home/Hero'
import FeaturedProjects from '@/components/home/FeaturedProjects'

export default async function HomePage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)

  let tagline = 'Contemporary architecture, through context'
  let description = ''
  let quote = ''
  let quoteAuthor = ''
  let featuredItems: (Project & { slide_image: string | null })[] = []

  try {
    const supabase = createServerClient()

    // Fetch home page content
    const { data: content } = await supabase
      .from('site_content')
      .select('*')
      .in('page_key', ['home_tagline', 'home_description', 'home_quote', 'home_quote_author'])

    const contentMap = (content || []).reduce<Record<string, SiteContent>>(
      (acc, item) => {
        acc[item.page_key] = item
        return acc
      },
      {}
    )

    tagline = contentMap.home_tagline
      ? getField(contentMap.home_tagline, 'content', lang)
      : 'Contemporary architecture, through context'

    description = contentMap.home_description
      ? getField(contentMap.home_description, 'content', lang)
      : ''

    quote = contentMap.home_quote
      ? getField(contentMap.home_quote, 'content', lang)
      : ''

    quoteAuthor = contentMap.home_quote_author
      ? getField(contentMap.home_quote_author, 'content', lang)
      : ''

    // Fetch homepage slides with linked projects
    const { data: slides } = await supabase
      .from('homepage_slides')
      .select('image_url, display_order, projects(*)')
      .order('display_order', { ascending: true })
      .limit(6)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featuredItems = (slides || []).map((s: any) => ({
      ...(s.projects as Project),
      slide_image: s.image_url as string | null,
    }))
  } catch (err) {
    console.error('[HomePage] Supabase error:', err)
  }

  return (
    <>
      <Hero tagline={tagline} description={description} quote={quote} quoteAuthor={quoteAuthor} />
      <FeaturedProjects
        projects={featuredItems}
        lang={lang}
      />
    </>
  )
}
