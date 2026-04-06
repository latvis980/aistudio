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
  const supabase = createServerClient()

  // Fetch home page content
  const { data: content } = await supabase
    .from('site_content')
    .select('*')
    .in('page_key', ['home_tagline', 'home_description'])

  const contentMap = (content || []).reduce<Record<string, SiteContent>>(
    (acc, item) => {
      acc[item.page_key] = item
      return acc
    },
    {}
  )

  const tagline = contentMap.home_tagline
    ? getField(contentMap.home_tagline, 'content', lang)
    : 'Contemporary architecture, through context'

  const description = contentMap.home_description
    ? getField(contentMap.home_description, 'content', lang)
    : ''

  // Fetch homepage slides with linked projects
  const { data: slides } = await supabase
    .from('homepage_slides')
    .select('image_url, display_order, projects(*)')
    .order('display_order', { ascending: true })
    .limit(6)

  const featuredItems = (slides || []).map((s: any) => ({
    ...(s.projects as Project),
    slide_image: s.image_url as string | null,
  }))

  return (
    <>
      <Hero tagline={tagline} description={description} />
      <FeaturedProjects
        projects={featuredItems}
        lang={lang}
      />
    </>
  )
}
