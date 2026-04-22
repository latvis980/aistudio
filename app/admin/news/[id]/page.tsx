'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { NewsItem, LANGUAGES } from '@/lib/types'
import {
  Toggle, ProjectPicker, ImageUpload, TranslateButton, SaveButton, Toast, ConfirmDialog,
} from '@/components/admin/AdminUI'
import { slugify } from '@/lib/utils'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

export default function NewsEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<NewsItem | null>(null)
  const [projects, setProjects] = useState<{ id: string; title_en: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { isDirty, resetInitialData } = useUnsavedChanges(item)

  const load = useCallback(async () => {
    const [{ data: newsData }, { data: projectData }] = await Promise.all([
      supabase.from('news').select('*').eq('id', id).single(),
      supabase.from('projects').select('id, title_en, slug').order('title_en'),
    ])
    if (!newsData) { router.push('/admin/news'); return }
    setItem(newsData as NewsItem)
    resetInitialData(newsData as NewsItem)
    setProjects(projectData || [])
    setLoading(false)
  }, [id, router, resetInitialData])

  useEffect(() => { load() }, [load])

  const updateLocal = (field: string, value: unknown) => {
    if (!item) return
    setItem({ ...item, [field]: value } as NewsItem)
  }

  const handleSave = async () => {
    if (!item) return
    setSaving(true)
    const { error } = await supabase.from('news').update({
      title_en: item.title_en,
      title_ru: item.title_ru,
      title_ar: item.title_ar,
      title_zh: item.title_zh,
      title_es: item.title_es,
      description_en: item.description_en,
      description_ru: item.description_ru,
      description_ar: item.description_ar,
      description_zh: item.description_zh,
      description_es: item.description_es,
      body_en: item.body_en,
      body_ru: item.body_ru,
      body_ar: item.body_ar,
      body_zh: item.body_zh,
      body_es: item.body_es,
      cover_image: item.cover_image,
      thumbnail_image: item.thumbnail_image,
      thumbnail_vertical: item.thumbnail_vertical,
      external_link: item.external_link,
      project_id: item.project_id,
      source: item.source,
      show_in_journal: item.show_in_journal,
      date: item.date,
      slug: item.slug,
    }).eq('id', id)
    setSaving(false)
    if (error) {
      setToast({ message: `Save failed: ${error.message}`, type: 'error' })
    } else {
      resetInitialData(item)
      setToast({ message: 'News item saved', type: 'success' })
      setTimeout(() => setToast(null), 2000)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('news').delete().eq('id', id)
    setDeleting(false)
    if (error) {
      setToast({ message: `Delete failed: ${error.message}`, type: 'error' })
      setShowDeleteConfirm(false)
    } else {
      router.push('/admin/news')
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
    setItem(updated as unknown as NewsItem)
    setToast({ message: 'Translations filled — review and save', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading || !item) return <div className="text-sm text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/news" className="text-xs text-gray-400 hover:text-gray-600 mb-1 inline-block">
            ← Back to news
          </Link>
          <h1 className="text-xl font-semibold">{item.title_en}</h1>
          <p className="text-sm text-gray-400">/{item.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
          <SaveButton onClick={handleSave} loading={saving} isDirty={isDirty} />
        </div>
      </div>

      {/* Quick controls */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <div>
          <label className="flex items-center gap-2 text-sm">
            <Toggle checked={item.show_in_journal} onChange={(v) => updateLocal('show_in_journal', v)} />
            Visible
          </label>
          <p className="text-[11px] text-gray-400 mt-1 ml-11">Shows this item in the Journal feed</p>
        </div>
      </div>

      {/* Metadata */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Metadata</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Source</label>
            <input
              type="text"
              value={item.source || ''}
              onChange={(e) => updateLocal('source', e.target.value)}
              placeholder="e.g. Dezeen, ArchDaily…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={item.date || ''}
              onChange={(e) => updateLocal('date', e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">External link</label>
            <input
              type="url"
              value={item.external_link || ''}
              onChange={(e) => updateLocal('external_link', e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={item.slug}
                onChange={(e) => updateLocal('slug', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
              />
              <button
                type="button"
                onClick={() => updateLocal('slug', slugify(item.title_en))}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50"
                title="Regenerate from title"
              >
                ↻
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">URL path for this news item. Click ↻ to regenerate from title</p>
          </div>
        </div>
      </fieldset>

      {/* Project link */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Linked Project</legend>
        <p className="text-xs text-gray-400 mb-3">Connect this news item to a project page.</p>
        <ProjectPicker
          value={item.project_id}
          onChange={(v) => updateLocal('project_id', v)}
          projects={projects}
        />
      </fieldset>

      {/* Cover image */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Cover Image</legend>
        <ImageUpload
          bucket="news-images"
          currentUrl={item.cover_image}
          onUploaded={(url) => updateLocal('cover_image', url)}
          slug={item.slug}
        />
      </fieldset>

      {/* Thumbnail image */}
      <fieldset className="p-4 bg-white border border-gray-200 rounded-lg mb-6">
        <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Thumbnail Image</legend>
        <p className="text-xs text-gray-400 mb-3">
          Optional. Used on the news list page (320×110). If blank, falls back to the Cover Image.
        </p>
        <ImageUpload
          bucket="news-images"
          currentUrl={item.thumbnail_image}
          onUploaded={(url) => updateLocal('thumbnail_image', url)}
          slug={`${item.slug}-thumb`}
        />
        <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
          <Toggle
            checked={item.thumbnail_vertical}
            onChange={(v) => updateLocal('thumbnail_vertical', v)}
          />
          Vertical (portrait) image — rotate 90° to fit thumbnail frame
        </label>
      </fieldset>

      {/* Translate */}
      <div className="mb-4">
        <TranslateButton
          fields={{
            title: { en: item.title_en || '', ru: item.title_ru || '', ar: item.title_ar || '', zh: item.title_zh || '', es: item.title_es || '' },
            description: { en: item.description_en || '', ru: item.description_ru || '', ar: item.description_ar || '', zh: item.description_zh || '', es: item.description_es || '' },
            body: { en: item.body_en || '', ru: item.body_ru || '', ar: item.body_ar || '', zh: item.body_zh || '', es: item.body_es || '' },
          }}
          onTranslated={handleTranslated}
        />
      </div>

      {/* Multilingual fields */}
      {LANGUAGES.map(({ code, label }) => (
        <fieldset key={code} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 mb-4">
          <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
            {label} {code === 'ar' && '(RTL)'}
          </legend>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={(item as unknown as Record<string, unknown>)[`title_${code}`] as string || ''}
              onChange={(e) => updateLocal(`title_${code}`, e.target.value)}
              dir={code === 'ar' ? 'rtl' : 'ltr'}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea
              value={(item as unknown as Record<string, unknown>)[`description_${code}`] as string || ''}
              onChange={(e) => updateLocal(`description_${code}`, e.target.value)}
              dir={code === 'ar' ? 'rtl' : 'ltr'}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Body (full text, markdown)</label>
            <textarea
              value={(item as unknown as Record<string, unknown>)[`body_${code}`] as string || ''}
              onChange={(e) => updateLocal(`body_${code}`, e.target.value)}
              dir={code === 'ar' ? 'rtl' : 'ltr'}
              rows={8}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-y font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
            />
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <SaveButton onClick={handleSave} loading={saving} isDirty={isDirty} />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete news item"
        message={`Are you sure you want to delete "${item.title_en}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </div>
  )
}