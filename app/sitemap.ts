// app/sitemap.ts

import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

const BASE_URL = 'https://aistudio.co.uk'

type ChangeFreq = 'daily' | 'weekly' | 'monthly' | 'yearly'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/works', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/studio', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/journal', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/news', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/press', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/cookie-policy', priority: 0.2, changeFrequency: 'yearly' },
]

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return staticEntries
  }

  try {
    const supabase = createServerClient()

    const [projectsRes, newsRes, pressRes] = await Promise.all([
      supabase.from('projects').select('slug, updated_at'),
      supabase.from('news').select('slug, date, created_at'),
      supabase.from('press').select('slug, date, created_at'),
    ])

    const projectEntries: MetadataRoute.Sitemap = (projectsRes.data || []).map((p) => ({
      url: `${BASE_URL}/works/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

    const newsEntries: MetadataRoute.Sitemap = (newsRes.data || []).map((n) => ({
      url: `${BASE_URL}/news/${n.slug}`,
      lastModified: new Date(n.date || n.created_at || now),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    const pressEntries: MetadataRoute.Sitemap = (pressRes.data || []).map((p) => ({
      url: `${BASE_URL}/press/${p.slug}`,
      lastModified: new Date(p.date || p.created_at || now),
      changeFrequency: 'monthly',
      priority: 0.5,
    }))

    return [...staticEntries, ...projectEntries, ...newsEntries, ...pressEntries]
  } catch (err) {
    console.error('[sitemap] Supabase error:', err)
    return staticEntries
  }
}
