import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import { Project } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import TagLabel from '@/components/ui/TagLabel'
import BracketLink from '@/components/ui/BracketLink'
import SpecsGrid from '@/components/ui/SpecsGrid'
import Gallery from '@/components/ui/Gallery'

interface Props {
  params: { slug: string }
}

export const dynamicParams = true

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
    return []
  }
  const supabase = createServerClient()
  const { data } = await supabase.from('projects').select('slug')
  return (data || []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: project } = await supabase
    .from('projects')
    .select('title_en, description_en, cover_image')
    .eq('slug', params.slug)
    .single()

  if (!project) return { title: 'Project Not Found' }

  return {
    title: project.title_en,
    description: project.description_en,
    openGraph: {
      title: `${project.title_en} — AI Studio`,
      description: project.description_en || undefined,
      images: project.cover_image ? [project.cover_image] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!project) notFound()

  const p = project as Project
  const title = getField(p, 'title', lang)
  const location = getField(p, 'location', lang)
  const body = getField(p, 'body', lang)
  const description = getField(p, 'description', lang)

  const { data: prevProject } = await supabase
    .from('projects')
    .select('slug, title_en')
    .lt('display_order', p.display_order)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const { data: nextProject } = await supabase
    .from('projects')
    .select('slug, title_en')
    .gt('display_order', p.display_order)
    .order('display_order', { ascending: true })
    .limit(1)
    .single()

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: t('works', lang), href: '/works' },
          { label: title },
        ]}
        lang={lang}
      />

      <div className="flex gap-3 mb-3">
        <TagLabel>{t(p.typology, lang)}</TagLabel>
        <TagLabel>{t(p.status, lang)}</TagLabel>
      </div>

      <h1 className="page-title mb-2">{title}</h1>

      {location && <p className="text-body text-muted mb-8">{location}</p>}

      {p.cover_image && (
        <div className="mb-12">
          <Image
            src={p.cover_image}
            alt={title}
            width={1200}
            height={700}
            className="w-full h-auto"
            sizes="(max-width: 1024px) 100vw, 900px"
            priority
          />
        </div>
      )}

      {(body || description) && (
        <section className="mb-12">
          <h2 className="section-label mb-6">{t('project_info', lang)}</h2>
          <div className="max-w-[700px] text-body text-ink/90 whitespace-pre-line">
            {body || description}
          </div>
        </section>
      )}

      <SpecsGrid
        specs={p.specs || {}}
        designTeam={p.design_team}
        executionTeam={p.execution_team}
      />

      <Gallery
        images={p.gallery || []}
        projectTitle={title}
        lang={lang}
      />

      <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
        {prevProject ? (
          <BracketLink href={`/works/${prevProject.slug}`}>
            {t('previous', lang)}
          </BracketLink>
        ) : (
          <div />
        )}
        {nextProject ? (
          <BracketLink href={`/works/${nextProject.slug}`}>
            {t('next', lang)}
          </BracketLink>
        ) : (
          <div />
        )}
      </div>
    </>
  )
}
