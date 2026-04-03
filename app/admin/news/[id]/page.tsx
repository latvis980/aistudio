'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { NewsItem } from '@/lib/types'
import { Toggle, ProjectPicker, Toast } from '@/components/admin/AdminUI'

type Filter = 'all' | 'unlinked'

export default function AdminNewsPage() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') as Filter | null

  const [items, setItems] = useState<NewsItem[]>([])
  const [projects, setProjects] = useState<{ id: string; title_en: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>(filterParam || 'all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const [{ data: newsData }, { data: projectData }] = await Promise.all([
      supabase.from('news').select('*').order('date', { ascending: false }),
      supabase.from('projects').select('id, title_en, slug').order('title_en'),
    ])
    setItems(newsData || [])
    setProjects(projectData || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateField = async (id: string, field: string, value: unknown) => {
    const { error } = await supabase.from('news').update({ [field]: value }).eq('id', id)
    if (error) {
      setToast({ message: error.message, type: 'error' }); return
    }
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)))
    setToast({ message: 'Updated', type: 'success' })
    setTimeout(() => setToast(null), 2000)
  }

  const filtered = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase()
      if (!item.title_en.toLowerCase().includes(q) && !item.slug.toLowerCase().includes(q)) return false
    }
    if (filter === 'unlinked') return !item.project_id
    return true
  })

  if (loading) return <div className="text-sm text-gray-400">Loading news…</div>

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">News</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} total · {filtered.length} shown</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news…"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white w-64
                     focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
        <div className="flex gap-1.5">
          {[
            { value: 'all' as Filter, label: 'All' },
            { value: 'unlinked' as Filter, label: 'Not linked' },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${filter === f.value ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">News item</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Linked project</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${!item.show_in_journal ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2.5">
                    <Toggle checked={item.show_in_journal} onChange={(v) => updateField(item.id, 'show_in_journal', v)} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/news/${item.id}`}
                      className="text-sm font-medium text-[#1a1a1a] hover:text-[#C75B2B] transition-colors">
                      {item.title_en}
                    </Link>
                    <div className="text-xs text-gray-400">{item.date}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{item.source}</td>
                  <td className="px-3 py-2.5">
                    <ProjectPicker value={item.project_id} onChange={(v) => updateField(item.id, 'project_id', v)} projects={projects} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/news/${item.id}`} className="text-xs text-gray-400 hover:text-[#C75B2B] transition-colors">Edit →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">No news items match this filter.</div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}