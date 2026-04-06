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

  // Fetch featured projects
  const { data: featuredProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(4)

  return (
    <>
      <Hero tagline={tagline} description={description} />
      <FeaturedProjects
        projects={(featuredProjects as Project[]) || []}
        lang={lang}
      />
    </>
  )
}
