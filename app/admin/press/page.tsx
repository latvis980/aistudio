'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { PressItem, PressCategory } from '@/lib/types'
import { Toggle, InlineSelect, ProjectPicker, Toast } from '@/components/admin/AdminUI'

const CATEGORIES: { value: PressCategory; label: string }[] = [
  { value: 'media', label: 'Media' },
  { value: 'interview', label: 'Interview' },
  { value: 'awards', label: 'Awards' },
]

type Filter = 'all' | 'unlinked' | 'featured' | PressCategory

export default function AdminPressPage() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') as Filter | null

  const [items, setItems] = useState<PressItem[]>([])
  const [projects, setProjects] = useState<{ id: string; title_en: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>(filterParam || 'all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const [{ data: pressData }, { data: projectData }] = await Promise.all([
      supabase.from('press').select('*').order('date', { ascending: false }),
      supabase.from('projects').select('id, title_en, slug').order('title_en'),
    ])
    setItems(pressData || [])
    setProjects(projectData || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateField = async (id: string, field: string, value: unknown) => {
    const { error } = await supabase.from('press').update({ [field]: value }).eq('id', id)
    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    setToast({ message: 'Updated', type: 'success' })
    setTimeout(() => setToast(null), 2000)
  }

  const filtered = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !item.title_en.toLowerCase().includes(q) &&
        !(item.publication_name || '').toLowerCase().includes(q) &&
        !item.slug.toLowerCase().includes(q)
      ) return false
    }
    switch (filter) {
      case 'unlinked': return !item.project_id
      case 'featured': return item.is_featured
      case 'all': return true
      default: return item.category === filter
    }
  })

  if (loading) return <div className="text-sm text-gray-400">Loading press…</div>

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Press</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} total · {filtered.length} shown</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search press…"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white w-64
                     focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
        />
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all' as Filter, label: 'All' },
            { value: 'unlinked' as Filter, label: 'Not linked' },
            { value: 'featured' as Filter, label: 'Featured' },
            ...CATEGORIES.map((c) => ({ value: c.value as Filter, label: c.label })),
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`
                px-2.5 py-1 text-xs rounded-md transition-colors
                ${filter === f.value
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Linked project</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${!item.show_in_journal ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2.5">
                    <Toggle
                      checked={item.show_in_journal}
                      onChange={(v) => {
                        updateField(item.id, 'show_in_journal', v)
                        if (!v && item.is_featured) updateField(item.id, 'is_featured', false)
                      }}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/press/${item.id}`}
                      className="text-sm font-medium text-[#1a1a1a] hover:text-[#C75B2B] transition-colors"
                    >
                      {item.title_en}
                    </Link>
                    <div className="text-xs text-gray-400">
                      {item.publication_name}
                      {item.date && ` · ${item.date}`}
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <InlineSelect
                      value={item.category}
                      options={CATEGORIES}
                      onChange={(v) => updateField(item.id, 'category', v)}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <ProjectPicker
                      value={item.project_id}
                      onChange={(v) => updateField(item.id, 'project_id', v)}
                      projects={projects}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <Toggle
                      checked={item.is_featured}
                      onChange={(v) => updateField(item.id, 'is_featured', v)}
                      disabled={!item.show_in_journal}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/press/${item.id}`}
                      className="text-xs text-gray-400 hover:text-[#C75B2B] transition-colors"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">No press items match this filter.</div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
