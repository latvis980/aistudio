// app/(public)/news/[slug]/page.tsx

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies, formatDate } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import { NewsItem } from '@/lib/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
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
  const { data } = await supabase.from('news').select('slug')
  return (data || []).map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('news')
    .select('title_en, description_en, cover_image')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'News Not Found' }

  return {
    title: data.title_en,
    description: data.description_en,
    openGraph: {
      title: `${data.title_en} — AI Studio`,
      description: data.description_en || undefined,
      images: data.cover_image ? [data.cover_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title_en} — AI Studio`,
      description: data.description_en || undefined,
      images: data.cover_image ? [data.cover_image] : undefined,
    },
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!data) notFound()

  const item = data as NewsItem
  const title = getField(item, 'title', lang)
  const description = getField(item, 'description', lang)
  const body = getField(item, 'body', lang)

  return (
      <>
        <Breadcrumb
          crumbs={[
            { label: t('studio_news', lang), href: '/news' },
            { label: title },
          ]}
          lang={lang}
        />

        {item.date && (
          <p className="text-body-sm text-muted mb-2">{formatDate(item.date, lang)}</p>
        )}
        {item.source && (
          <p className="text-tag uppercase tracking-wide-tag text-ink/70 mb-4">{item.source}</p>
        )}

        <h1 className="page-title mb-8">{title}</h1>

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

          {item.external_link && (
            <div className="mt-8">
              <BracketLink href={item.external_link} external>
                {t('read_more', lang)}
              </BracketLink>
            </div>
          )}

        </div>
        {/* ── end 700px column ── */}

        <div className="mt-16 pt-8 border-t border-border">
          <BracketLink href="/news">{t('studio_news', lang)}</BracketLink>
        </div>
      </>
    )
  }