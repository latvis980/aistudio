'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { PressItem, PressCategory, LANGUAGES } from '@/lib/types'
import {
  Toggle, InlineSelect, ProjectPicker, ImageUpload, TranslateButton, SaveButton, Toast,
} from '@/components/admin/AdminUI'

const CATEGORIES: { value: PressCategory; label: string }[] = [
  { value: 'media', label: 'Media' },
  { value: 'interview', label: 'Interview' },
  { value: 'awards', label: 'Awards' },
]

export default function PressEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<PressItem | null>(null)
  const [projects, setProjects] = useState<{ id: string; title_en: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const [{ data: pressData }, { data: projectData }] = await Promise.all([
      supabase.from('press').select('*').eq('id', id).single(),
      supabase.from('projects').select('id, title_en, slug').order('title_en'),
    ])
    if (!pressData) { router.push('/admin/press'); return }
    setItem(pressData as PressItem)
    setProjects(projectData || [])
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  const updateLocal = (field: string, value: unknown) => {
    if (!item) return
    setItem({ ...item, [field]: value } as PressItem)
  }

  const handleSave = async () => {
    if (!item) return
    setSaving(true)
    const { error } = await supabase.from('press').update({
      title_en: item.title_en, title_ru: item.title_ru, title_ar: item.title_ar,
      title_zh: item.title_zh, title_es: item.title_es,
      description_en: item.description_en, description_ru: item.description_ru,
      description_ar: item.description_ar, description_zh: item.description_zh,
      description_es: item.description_es,
      category: item.category, publication_name: item.publication_name,
      cover_image: item.cover_image, external_link: item.external_link,
      project_id: item.project_id, is_featured: item.is_featured,
      show_in_journal: item.show_in_journal, date: item.date, slug: item.slug,
    }).eq('id', id)
    setSaving(false)
    if (error) {
      setToast({ message: `Save failed: ${error.message}`, type: 'error' })
    } else {
      setToast({ message: 'Press item saved', type: 'success' })
      setTimeout(() => setToast(null), 2000)
    }
  }

  const handleTranslated = (translations: Record<string, Record<string, string>>) => {
    if (!item) return
    const updated = { ...item } as Record<string, unknown>
    for (const [field, langs] of Object.entries(translations)) {
      for (const [lang, text] of Object.entries(langs)) {
        updated[`${field}_${lang}`] = text
      }
    }
    setItem(updated as unknown as PressItem)
    setToast({ message: 'Translations filled — review and save', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading || !item) return <div className="text-sm text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/press" className="text-xs text-gray-400 hover:text-gray-600 mb-1 inline-block">← Back to press</Link>
          <h1 className="text-xl font-semibold">{item.title_en}</h1>
          <p className="text-sm text-gray-400">/{item.slug}</p>
        </div>
        <SaveButton onClick={handleSave} loading={saving} />
      </div>

      {/* Quick controls */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <label className="flex items-center gap-2 text-sm">
          <Toggle checked={item.show_in_journal} onChange={(v) => updateLocal('show_in_journal', v)} />
          Visible
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Toggle checked={item.is_featured} onChange={(v) => updateLocal('is_featured', v)} />
          Featured
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Category:</span>
          <InlineSelect value={item.category} options={CATEGORIES} onChange={(v) => updateLocal('category', v)} />
        </div>
      </div>

      {/* Metadata */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Metadata</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Publication</label>
            <input type="text" value={item.publication_name || ''} onChange={(e) => updateLocal('publication_name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input type="date" value={item.date || ''} onChange={(e) => updateLocal('date', e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">External link</label>
            <input type="url" value={item.external_link || ''} onChange={(e) => updateLocal('external_link', e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <input type="text" value={item.slug} onChange={(e) => updateLocal('slug', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
          </div>
        </div>
      </fieldset>

      {/* Project link */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Linked Project</legend>
        <ProjectPicker value={item.project_id} onChange={(v) => updateLocal('project_id', v)} projects={projects} />
      </fieldset>

      {/* Cover image */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Cover Image</legend>
        <ImageUpload bucket="press-images" currentUrl={item.cover_image} onUploaded={(url) => updateLocal('cover_image', url)} slug={item.slug} />
      </fieldset>

      {/* Translate */}
      <div className="mb-4">
        <TranslateButton
          fields={{ title: item.title_en, description: item.description_en || '' }}
          onTranslated={handleTranslated}
        />
      </div>

      {/* Multilingual fields */}
      {LANGUAGES.map(({ code, label }) => (
        <fieldset key={code} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 mb-4">
          <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">{label}</legend>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={(item as unknown as Record<string, unknown>)[`title_${code}`] as string || ''}
              onChange={(e) => updateLocal(`title_${code}`, e.target.value)}
              dir={code === 'ar' ? 'rtl' : 'ltr'}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea value={(item as unknown as Record<string, unknown>)[`description_${code}`] as string || ''}
              onChange={(e) => updateLocal(`description_${code}`, e.target.value)}
              dir={code === 'ar' ? 'rtl' : 'ltr'} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]" />
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <SaveButton onClick={handleSave} loading={saving} />
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}