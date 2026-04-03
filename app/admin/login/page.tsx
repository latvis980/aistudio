'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface Stats {
  projects: number
  projectsHidden: number
  projectsNoCover: number
  press: number
  pressUnlinked: number
  news: number
  newsUnlinked: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const [
        { count: projects },
        { count: projectsHidden },
        { count: projectsNoCover },
        { count: press },
        { count: pressUnlinked },
        { count: news },
        { count: newsUnlinked },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('show_in_journal', false),
        supabase.from('projects').select('*', { count: 'exact', head: true }).is('cover_image', null),
        supabase.from('press').select('*', { count: 'exact', head: true }),
        supabase.from('press').select('*', { count: 'exact', head: true }).is('project_id', null),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }).is('project_id', null),
      ])

      setStats({
        projects: projects || 0,
        projectsHidden: projectsHidden || 0,
        projectsNoCover: projectsNoCover || 0,
        press: press || 0,
        pressUnlinked: pressUnlinked || 0,
        news: news || 0,
        newsUnlinked: newsUnlinked || 0,
      })
    }
    load()
  }, [])

  if (!stats) return <div className="text-sm text-gray-400">Loading…</div>

  const cards = [
    {
      label: 'Projects',
      href: '/admin/projects',
      value: stats.projects,
      sub: `${stats.projectsHidden} hidden · ${stats.projectsNoCover} missing cover`,
      color: 'border-l-emerald-400',
    },
    {
      label: 'Press',
      href: '/admin/press',
      value: stats.press,
      sub: `${stats.pressUnlinked} not linked to a project`,
      color: 'border-l-blue-400',
    },
    {
      label: 'News',
      href: '/admin/news',
      value: stats.news,
      sub: `${stats.newsUnlinked} not linked to a project`,
      color: 'border-l-violet-400',
    },
  ]

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`
              block bg-white border border-gray-200 ${card.color} border-l-4 rounded-lg p-5
              hover:shadow-sm transition-shadow
            `}
          >
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className="text-3xl font-semibold mb-1">{card.value}</div>
            <div className="text-xs text-gray-400">{card.sub}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/projects?filter=hidden"
            className="px-4 py-3 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Review hidden projects <span className="text-gray-400">({stats.projectsHidden})</span>
          </Link>
          <Link
            href="/admin/press?filter=unlinked"
            className="px-4 py-3 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Link press to projects <span className="text-gray-400">({stats.pressUnlinked})</span>
          </Link>
          <Link
            href="/admin/news?filter=unlinked"
            className="px-4 py-3 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Link news to projects <span className="text-gray-400">({stats.newsUnlinked})</span>
          </Link>
          <Link
            href="/admin/projects?filter=nocover"
            className="px-4 py-3 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Upload missing covers <span className="text-gray-400">({stats.projectsNoCover})</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
