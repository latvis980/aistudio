'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface Stats {
  projectsTotal: number
  projectsHidden: number
  projectsNoCover: number
  pressTotal: number
  pressUnlinked: number
  newsTotal: number
  newsUnlinked: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [
        { data: projects },
        { data: press },
        { data: news },
      ] = await Promise.all([
        supabase.from('projects').select('id, show_in_journal, cover_image'),
        supabase.from('press').select('id, project_id, show_in_journal'),
        supabase.from('news').select('id, project_id, show_in_journal'),
      ])

      setStats({
        projectsTotal: projects?.length ?? 0,
        projectsHidden: projects?.filter((p) => !p.show_in_journal).length ?? 0,
        projectsNoCover: projects?.filter((p) => !p.cover_image).length ?? 0,
        pressTotal: press?.length ?? 0,
        pressUnlinked: press?.filter((p) => !p.project_id).length ?? 0,
        newsTotal: news?.length ?? 0,
        newsUnlinked: news?.filter((n) => !n.project_id).length ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Overview of content status</p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Projects"
              total={stats.projectsTotal}
              alerts={[
                stats.projectsHidden > 0 && {
                  label: `${stats.projectsHidden} hidden`,
                  href: '/admin/projects?filter=hidden',
                },
                stats.projectsNoCover > 0 && {
                  label: `${stats.projectsNoCover} missing cover`,
                  href: '/admin/projects?filter=nocover',
                },
              ]}
              href="/admin/projects"
            />
            <StatCard
              title="Press"
              total={stats.pressTotal}
              alerts={[
                stats.pressUnlinked > 0 && {
                  label: `${stats.pressUnlinked} not linked to project`,
                  href: '/admin/press?filter=unlinked',
                },
              ]}
              href="/admin/press"
            />
            <StatCard
              title="News"
              total={stats.newsTotal}
              alerts={[
                stats.newsUnlinked > 0 && {
                  label: `${stats.newsUnlinked} not linked to project`,
                  href: '/admin/news?filter=unlinked',
                },
              ]}
              href="/admin/news"
            />
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <QuickAction
                href="/admin/projects?filter=hidden"
                label="Review hidden projects"
                description="Check which works are hidden and decide what to publish"
                count={stats.projectsHidden}
              />
              <QuickAction
                href="/admin/projects?filter=nocover"
                label="Projects missing covers"
                description="Upload cover images for projects that don't have one"
                count={stats.projectsNoCover}
              />
              <QuickAction
                href="/admin/press?filter=unlinked"
                label="Link press to projects"
                description="Connect press articles to the right project pages"
                count={stats.pressUnlinked}
              />
              <QuickAction
                href="/admin/news?filter=unlinked"
                label="Link news to projects"
                description="Connect news items to the right project pages"
                count={stats.newsUnlinked}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  title,
  total,
  alerts,
  href,
}: {
  title: string
  total: number
  alerts: (false | { label: string; href: string })[]
  href: string
}) {
  const activeAlerts = alerts.filter(Boolean) as { label: string; href: string }[]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl font-semibold">{total}</div>
        <Link
          href={href}
          className="text-xs text-gray-400 hover:text-[#C75B2B] transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="text-sm font-medium text-[#1a1a1a] mb-2">{title}</div>
      {activeAlerts.length > 0 ? (
        <div className="space-y-1">
          {activeAlerts.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              {a.label}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-green-600">All good</p>
      )}
    </div>
  )
}

function QuickAction({
  href,
  label,
  description,
  count,
}: {
  href: string
  label: string
  description: string
  count: number
}) {
  if (count === 0) return null
  return (
    <Link
      href={href}
      className="
        flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg
        hover:border-[#C75B2B]/40 hover:bg-gray-50/50 transition-colors group
      "
    >
      <div className="shrink-0 w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-xs font-semibold text-amber-700 group-hover:bg-amber-100 transition-colors">
        {count}
      </div>
      <div>
        <div className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#C75B2B] transition-colors">
          {label}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{description}</div>
      </div>
    </Link>
  )
}
