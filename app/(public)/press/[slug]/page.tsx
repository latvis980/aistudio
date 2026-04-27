// app/(public)/press/[slug]/page.tsx

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies, formatDate } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import { PressItem } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import TagLabel from '@/components/ui/TagLabel'
import BracketLink from '@/components/ui/BracketLink'

interface Props {
  params: { slug: string }
}

export const dynamicParams = true

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return []
  }
  const supabase = createServerClient()
  const { data } = await supabase.from('press').select('slug')
  return (data || []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('press')
    .select('title_en, description_en, cover_image')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Press Not Found' }

  return {
    title: data.title_en,
    description: data.description_en,
    openGraph: {
      title: `${data.title_en} — ai studio`,
      description: data.description_en || undefined,
      images: data.cover_image ? [data.cover_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title_en} — ai studio`,
      description: data.description_en || undefined,
      images: data.cover_image ? [data.cover_image] : undefined,
    },
  }
}

export default async function PressDetailPage({ params }: Props) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data } = await supabase
    .from('press')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!data) notFound()

  const item = data as PressItem
  const title = getField(item, 'title', lang)
  const description = getField(item, 'description', lang)
  const body = getField(item, 'body', lang)

  // If linked to a project, fetch the project slug for linking
  let projectSlug: string | null = null
  let projectTitle: string | null = null
  if (item.project_id) {
    const { data: proj } = await supabase
      .from('projects')
      .select('slug, title_en')
      .eq('id', item.project_id)
      .single()
    if (proj) {
      projectSlug = proj.slug
      projectTitle = proj.title_en
    }
  }

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: t('press', lang), href: '/press' },
          { label: title },
        ]}
        lang={lang}
      />

      <div className="flex items-center gap-3 mb-4">
        <TagLabel>{t(item.category, lang)}</TagLabel>
        {item.publication_name && (
          <div className="flex items-center gap-2">
            {item.favicon_url && (
              <Image src={item.favicon_url} alt="" width={16} height={16} className="rounded-sm" />
            )}
            <span className="text-tag uppercase tracking-wide-tag text-ink/70">
              {item.publication_name}
            </span>
          </div>
        )}
      </div>

      {item.date && (
        <p className="text-body-sm text-muted mb-2">{formatDate(item.date, lang)}</p>
      )}

      <h1 className="text-[1.05rem] lg:text-[2.45rem] lowercase font-light text-ink leading-[1.1] mb-8">
        {title}
      </h1>

      {/* ── 700px content column ── */}
      <div className="max-w-[700px]">

        {item.cover_image && (
          <div className="mb-12">
            <Image
              src={item.cover_image}
              alt={title}
              width={700}
              height={467}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          </div>
        )}

        {(body || description) && (
          <section className="mb-12">
            <div className="text-body text-ink/90 whitespace-pre-line">
              {body || description}
            </div>
          </section>
        )}

        <div className="flex gap-4 mt-8">
          {item.external_link && (
            <BracketLink href={item.external_link} external>
              {t('read_full_article', lang)}
            </BracketLink>
          )}
          {projectSlug && (
            <BracketLink href={`/works/${projectSlug}`}>
              {projectTitle || t('project', lang)}
            </BracketLink>
          )}
        </div>

      </div>
      {/* ── end 700px column ── */}

      <div className="mt-16 pt-8 border-t border-border">
        <BracketLink href="/press">{t('press', lang)}</BracketLink>
      </div>
    </>
  )
}