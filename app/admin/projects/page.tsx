'use client'

// app/admin/projects/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Project, Typology, Status } from '@/lib/types'
import { Toggle, InlineSelect, Toast } from '@/components/admin/AdminUI'
import { useAdminProjects } from '../projects-context'

function thumbnailUrl(url: string): string {
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=100&height=100'
}

const TYPOLOGIES: { value: Typology; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'office', label: 'Office' },
  { value: 'public', label: 'Public' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'mixed-use', label: 'Mixed-use' },
  { value: 'masterplan', label: 'Masterplan' },
  { value: 'interior', label: 'Interior' },
]

const STATUSES: { value: Status; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'construction', label: 'Construction' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'concept', label: 'Concept' },
]

type Filter = 'all' | 'hidden' | 'featured' | 'nocover' | Typology | Status
type SortKey = 'alpha' | 'updated' | 'order'
type SortDir = 'asc' | 'desc'

export default function AdminProjectsPage() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') as Filter | null
  const router = useRouter()

  const { projects: cachedProjects, setProjects: cacheProjects } = useAdminProjects()
  const [projects, setProjectsLocal] = useState<Project[]>(cachedProjects || [])
  const [loading, setLoading] = useState(!cachedProjects)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>(filterParam || 'all')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Sync local state to cache on every change
  const setProjects = useCallback((update: Project[] | ((prev: Project[]) => Project[])) => {
    setProjectsLocal((prev) => {
      const next = typeof update === 'function' ? update(prev) : update
      cacheProjects(next)
      return next
    })
  }, [cacheProjects])

  const loadProjects = useCallback(async () => {
    if (cachedProjects) return // already cached — skip fetch

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      setToast({ message: error.message, type: 'error' })
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [cachedProjects, setProjects])

  useEffect(() => { loadProjects() }, [loadProjects])

  // ── Inline field updates ─────────────────────────
  const updateField = async (id: string, field: string, value: unknown) => {
    const { error } = await supabase
      .from('projects')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      setToast({ message: `Update failed: ${error.message}`, type: 'error' })
      return
    }

    // Optimistic update (also syncs to context cache)
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
    setToast({ message: 'Updated', type: 'success' })
    setTimeout(() => setToast(null), 2000)
  }

  const handleCreate = async () => {
    const { data, error } = await supabase.from('projects').insert({
      title_en: 'Untitled',
      slug: 'untitled-' + Date.now(),
      show_in_journal: false,
      typology: 'residential',
      status: 'concept',
      is_featured: false,
      gallery: [],
      specs: {},
    }).select().single()
    if (error) {
      setToast({ message: `Create failed: ${error.message}`, type: 'error' })
      return
    }
    router.push(`/admin/projects/${data.id}`)
  }

  // ── Filtering ────────────────────────────────────
  const filtered = projects.filter((p) => {
    // Search
    if (search) {
      const q = search.toLowerCase()
      if (
        !p.title_en.toLowerCase().includes(q) &&
        !p.slug.toLowerCase().includes(q) &&
        !(p.location_en || '').toLowerCase().includes(q)
      ) return false
    }

    // Filter
    switch (filter) {
      case 'hidden':
        return !p.show_in_journal
      case 'featured':
        return p.is_featured
      case 'nocover':
        return !p.cover_image
      case 'all':
        return true
      default:
        // Typology or status
        if (TYPOLOGIES.some((t) => t.value === filter)) return p.typology === filter
        if (STATUSES.some((s) => s.value === filter)) return p.status === filter
        return true
    }
  })

  // ── Sorting ──────────────────────────────────────
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        let cmp = 0
        if (sortKey === 'alpha') {
          cmp = a.title_en.localeCompare(b.title_en)
        } else if (sortKey === 'order') {
          cmp = (a.display_order ?? Infinity) - (b.display_order ?? Infinity)
        } else {
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
    : filtered

  // ── Bulk actions ─────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkToggleVisibility = async (visible: boolean) => {
    const ids = Array.from(selected)
    const { error } = await supabase
      .from('projects')
      .update(visible ? { show_in_journal: visible } : { show_in_journal: false, is_featured: false })
      .in('id', ids)

    if (error) {
      setToast({ message: error.message, type: 'error' })
    } else {
      setProjects((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, show_in_journal: visible, ...(visible ? {} : { is_featured: false }) } : p))
      )
      setSelected(new Set())
      setToast({ message: `${ids.length} projects ${visible ? 'shown' : 'hidden'}`, type: 'success' })
      setTimeout(() => setToast(null), 2000)
    }
  }

  if (loading) return <div className="text-sm text-gray-400">Loading projects…</div>

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">{projects.length} total · {filtered.length} shown</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-3 py-1.5 text-sm bg-[#1a1a1a] text-white rounded-md hover:bg-[#333] transition-colors"
        >
          + New
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white w-64
                     focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
        />

        {/* Filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all' as Filter, label: 'All' },
            { value: 'hidden' as Filter, label: 'Hidden' },
            { value: 'featured' as Filter, label: 'Featured' },
            { value: 'nocover' as Filter, label: 'No cover' },
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

          {/* Typology dropdown */}
          <InlineSelect
            value={TYPOLOGIES.some((t) => t.value === filter) ? filter : ''}
            options={[{ value: '', label: 'Typology…' }, ...TYPOLOGIES]}
            onChange={(v) => setFilter((v || 'all') as Filter)}
          />

          {/* Status dropdown */}
          <InlineSelect
            value={STATUSES.some((s) => s.value === filter) ? filter : ''}
            options={[{ value: '', label: 'Status…' }, ...STATUSES]}
            onChange={(v) => setFilter((v || 'all') as Filter)}
          />
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-400 mr-1">Sort by</span>
          <button
            onClick={() => toggleSort('alpha')}
            title="Sort alphabetically"
            className={`
              flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors
              ${sortKey === 'alpha'
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            A–Z
            <span className="text-[10px] leading-none">
              {sortKey === 'alpha' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
            </span>
          </button>
          <button
            onClick={() => toggleSort('updated')}
            title="Sort by last updated"
            className={`
              flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors
              ${sortKey === 'updated'
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            Updated
            <span className="text-[10px] leading-none">
              {sortKey === 'updated' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
            </span>
          </button>
          <button
            onClick={() => toggleSort('order')}
            title="Sort by display order"
            className={`
              flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors
              ${sortKey === 'order'
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            Order
            <span className="text-[10px] leading-none">
              {sortKey === 'order' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
            </span>
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-gray-100 rounded-md">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={() => bulkToggleVisibility(false)}
            className="px-2.5 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
          >
            Hide selected
          </button>
          <button
            onClick={() => bulkToggleVisibility(true)}
            className="px-2.5 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
          >
            Show selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-8 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.size === sorted.length && sorted.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(new Set(sorted.map((p) => p.id)))
                      } else {
                        setSelected(new Set())
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typology</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((project) => (
                <tr
                  key={project.id}
                  className={`
                    hover:bg-gray-50/50 transition-colors
                    ${!project.show_in_journal ? 'opacity-50' : ''}
                  `}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(project.id)}
                      onChange={() => toggleSelect(project.id)}
                      className="rounded border-gray-300"
                    />
                  </td>

                  {/* Visible toggle */}
                  <td className="px-3 py-2.5">
                    <Toggle
                      checked={project.show_in_journal}
                      onChange={(v) => {
                        updateField(project.id, 'show_in_journal', v)
                        if (!v && project.is_featured) updateField(project.id, 'is_featured', false)
                      }}
                    />
                  </td>

                  {/* Cover thumbnail */}
                  <td className="px-3 py-2.5">
                    {project.cover_image ? (
                      <div className="w-12 h-8 rounded overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailUrl(project.cover_image)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400">none</span>
                      </div>
                    )}
                  </td>

                  {/* Title + slug */}
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm font-medium text-[#1a1a1a] hover:text-[#C75B2B] transition-colors"
                    >
                      {project.title_en}
                    </Link>
                    <div className="text-xs text-gray-400">/{project.slug}</div>
                    {project.location_en && (
                      <div className="text-xs text-gray-400">{project.location_en}</div>
                    )}
                  </td>

                  {/* Typology - inline edit */}
                  <td className="px-3 py-2.5">
                    <InlineSelect
                      value={project.typology}
                      options={TYPOLOGIES}
                      onChange={(v) => updateField(project.id, 'typology', v)}
                    />
                  </td>

                  {/* Status - inline edit */}
                  <td className="px-3 py-2.5">
                    <InlineSelect
                      value={project.status}
                      options={STATUSES}
                      onChange={(v) => updateField(project.id, 'status', v)}
                    />
                  </td>

                  {/* Featured toggle */}
                  <td className="px-3 py-2.5">
                    <Toggle
                      checked={project.is_featured}
                      onChange={(v) => updateField(project.id, 'is_featured', v)}
                      disabled={!project.show_in_journal}
                    />
                  </td>

                  {/* Display order */}
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      value={project.display_order ?? ''}
                      onChange={(e) => updateField(project.id, 'display_order', parseInt(e.target.value) || null)}
                      className="w-14 px-1.5 py-0.5 text-xs text-center border border-gray-200 rounded bg-white
                                 focus:outline-none focus:border-[#C75B2B]"
                    />
                  </td>

                  {/* Edit link */}
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/projects/${project.id}`}
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

        {sorted.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No projects match this filter.
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
