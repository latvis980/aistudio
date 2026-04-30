'use client'

// app/admin/projects/[id]/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Project, Typology, Status, LANGUAGES, GalleryImage } from '@/lib/types'
import {
  Toggle, InlineSelect, ImageUpload, TranslateButton, SaveButton, Toast, ConfirmDialog,
} from '@/components/admin/AdminUI'
import { slugify } from '@/lib/utils'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

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

const SPEC_FIELDS = [
  'address', 'floors', 'structure', 'total_area', 'units', 'parking',
  'completion', 'budget', 'developer', 'programme', 'mep', 'photos_by',
]

type Tab = 'content' | 'specs' | 'gallery' | 'seo'

export default function ProjectEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<Tab>('content')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { isDirty, resetInitialData } = useUnsavedChanges(project)

  const loadProject = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      setToast({ message: 'Project not found', type: 'error' })
      router.push('/admin/projects')
      return
    }
    setProject(data as Project)
    resetInitialData(data as Project)
    setLoading(false)
  }, [id, router, resetInitialData])

  useEffect(() => { loadProject() }, [loadProject])

  // ── Helpers ──────────────────────────────────────
  const updateLocal = (field: string, value: unknown) => {
    if (!project) return
    setProject({ ...project, [field]: value } as Project)
  }

  const updateSpecs = (key: string, value: string) => {
    if (!project) return
    setProject({
      ...project,
      specs: { ...project.specs, [key]: value },
    })
  }

  // ── Save ─────────────────────────────────────────
  const handleSave = async () => {
    if (!project) return
    setSaving(true)

    const { error } = await supabase
      .from('projects')
      .update({
        title_en: project.title_en,
        title_ru: project.title_ru,
        title_ar: project.title_ar,
        title_zh: project.title_zh,
        title_es: project.title_es,
        location_en: project.location_en,
        location_ru: project.location_ru,
        location_ar: project.location_ar,
        location_zh: project.location_zh,
        location_es: project.location_es,
        description_en: project.description_en,
        description_ru: project.description_ru,
        description_ar: project.description_ar,
        description_zh: project.description_zh,
        description_es: project.description_es,
        body_en: project.body_en,
        body_ru: project.body_ru,
        body_ar: project.body_ar,
        body_zh: project.body_zh,
        body_es: project.body_es,
        typology: project.typology,
        status: project.status,
        is_featured: project.is_featured,
        show_in_journal: project.show_in_journal,
        cover_image: project.cover_image,
        gallery: project.gallery,
        specs: project.specs,
        design_team: project.design_team,
        execution_team: project.execution_team,
        display_order: project.display_order,
        slug: project.slug,
        vimeo_url: project.vimeo_url,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      setToast({ message: `Save failed: ${error.message}`, type: 'error' })
    } else {
      resetInitialData(project)
      setToast({ message: 'Project saved', type: 'success' })
      setTimeout(() => setToast(null), 2000)
    }
  }

  // ── Delete ───────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    setDeleting(false)
    if (error) {
      setToast({ message: `Delete failed: ${error.message}`, type: 'error' })
      setShowDeleteConfirm(false)
    } else {
      router.push('/admin/projects')
    }
  }

  // ── Translate ────────────────────────────────────
  const handleTranslated = (translations: Record<string, Record<string, string>>) => {
    if (!project) return
    const updated = { ...project } as Record<string, unknown>

    for (const [field, langs] of Object.entries(translations)) {
      for (const [lang, text] of Object.entries(langs)) {
        updated[`${field}_${lang}`] = text
      }
    }

    setProject(updated as unknown as Project)
    setToast({ message: 'Translations filled — review and save', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading || !project) {
    return <div className="text-sm text-gray-400">Loading project…</div>
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/projects" className="text-xs text-gray-400 hover:text-gray-600 mb-1 inline-block">
            ← Back to projects
          </Link>
          <h1 className="text-xl font-semibold">{project.title_en}</h1>
          <p className="text-sm text-gray-400">/{project.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/works/${project.slug}`}
            target="_blank"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ↗ View
          </Link>
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

      {/* Quick toggles */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <div>
          <label className="flex items-center gap-2 text-sm">
            <Toggle checked={project.show_in_journal} onChange={(v) => {
              updateLocal('show_in_journal', v)
              if (!v) updateLocal('is_featured', false)
            }} />
            <span>Visible on site</span>
          </label>
          <p className="text-[11px] text-gray-400 mt-1 ml-11">Shows this project in the Journal feed</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <Toggle checked={project.is_featured} onChange={(v) => updateLocal('is_featured', v)} disabled={!project.show_in_journal} />
            <span>Featured</span>
          </label>
          <p className="text-[11px] text-gray-400 mt-1 ml-11">Pins to the top of the Journal feed</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Typology:</span>
          <InlineSelect
            value={project.typology}
            options={TYPOLOGIES}
            onChange={(v) => updateLocal('typology', v)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Status:</span>
          <InlineSelect
            value={project.status}
            options={STATUSES}
            onChange={(v) => updateLocal('status', v)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['content', 'specs', 'gallery', 'seo'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px
              ${tab === t
                ? 'border-[#1a1a1a] text-[#1a1a1a] font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── CONTENT TAB ──────────────────────── */}
      {tab === 'content' && (
        <div className="space-y-6">
          {/* Translate button */}
          <TranslateButton
            fields={{
              title: { en: project.title_en, ru: project.title_ru || '', ar: project.title_ar || '', zh: project.title_zh || '', es: project.title_es || '' },
              location: { en: project.location_en || '', ru: project.location_ru || '', ar: project.location_ar || '', zh: project.location_zh || '', es: project.location_es || '' },
              description: { en: project.description_en || '', ru: project.description_ru || '', ar: project.description_ar || '', zh: project.description_zh || '', es: project.description_es || '' },
              body: { en: project.body_en || '', ru: project.body_ru || '', ar: project.body_ar || '', zh: project.body_zh || '', es: project.body_es || '' },
            }}
            onTranslated={handleTranslated}
          />

          {/* Cover image */}
          <fieldset className="p-4 bg-white border border-gray-200 rounded-lg">
            <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Cover Image</legend>
            <ImageUpload
              bucket="project-images"
              currentUrl={project.cover_image}
              onUploaded={(url) => updateLocal('cover_image', url)}
              onRemove={() => updateLocal('cover_image', null)}
              slug={project.slug}
            />
          </fieldset>

          {/* Vimeo video */}
          <fieldset className="p-4 bg-white border border-gray-200 rounded-lg">
            <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Vimeo Video</legend>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Vimeo URL</label>
              <input
                type="text"
                value={project.vimeo_url || ''}
                onChange={(e) => updateLocal('vimeo_url', e.target.value || null)}
                placeholder="https://vimeo.com/123456789"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
              />
              <p className="text-xs text-gray-400 mt-1">Video will appear at the end of the gallery</p>
            </div>
          </fieldset>

          {/* Multilingual fields */}
          {LANGUAGES.map(({ code, label }) => (
            <fieldset key={code} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
              <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                {label} {code === 'ar' && '(RTL)'}
              </legend>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={(project as unknown as Record<string, unknown>)[`title_${code}`] as string || ''}
                  onChange={(e) => updateLocal(`title_${code}`, e.target.value)}
                  dir={code === 'ar' ? 'rtl' : 'ltr'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                             focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Location</label>
                <input
                  type="text"
                  value={(project as unknown as Record<string, unknown>)[`location_${code}`] as string || ''}
                  onChange={(e) => updateLocal(`location_${code}`, e.target.value)}
                  dir={code === 'ar' ? 'rtl' : 'ltr'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                             focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Description (short)</label>
                <textarea
                  value={(project as unknown as Record<string, unknown>)[`description_${code}`] as string || ''}
                  onChange={(e) => updateLocal(`description_${code}`, e.target.value)}
                  dir={code === 'ar' ? 'rtl' : 'ltr'}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white resize-y
                             focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Body (full text, markdown)</label>
                <textarea
                  value={(project as unknown as Record<string, unknown>)[`body_${code}`] as string || ''}
                  onChange={(e) => updateLocal(`body_${code}`, e.target.value)}
                  dir={code === 'ar' ? 'rtl' : 'ltr'}
                  rows={8}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white resize-y font-mono text-xs
                             focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                />
              </div>
            </fieldset>
          ))}
        </div>
      )}

      {/* ── SPECS TAB ────────────────────────── */}
      {tab === 'specs' && (
        <div className="space-y-6">
          <fieldset className="p-4 bg-white border border-gray-200 rounded-lg">
            <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Project Specs</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SPEC_FIELDS.map((key) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    value={(project.specs as Record<string, string>)?.[key] || ''}
                    onChange={(e) => updateSpecs(key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                               focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
            <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Teams</legend>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Design team (comma-separated)</label>
              <input
                type="text"
                value={(project.design_team || []).join(', ')}
                onChange={(e) =>
                  updateLocal('design_team', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Execution team (comma-separated)</label>
              <input
                type="text"
                value={(project.execution_team || []).join(', ')}
                onChange={(e) =>
                  updateLocal('execution_team', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                           focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
              />
            </div>
          </fieldset>

          <fieldset className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
            <legend className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Metadata</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Slug</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={project.slug}
                    onChange={(e) => updateLocal('slug', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                               focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                  />
                  <button
                    type="button"
                    onClick={() => updateLocal('slug', slugify(project.title_en))}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50"
                    title="Regenerate from title"
                  >
                    ↻
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">URL path for this project. Click ↻ to regenerate from title</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Display order</label>
                <input
                  type="number"
                  value={project.display_order ?? ''}
                  onChange={(e) => updateLocal('display_order', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white
                             focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">Lower numbers appear first in the Works grid</p>
              </div>
            </div>
          </fieldset>
        </div>
      )}

      {/* ── GALLERY TAB ──────────────────────── */}
      {tab === 'gallery' && (
        <GalleryEditor
          gallery={project.gallery || []}
          coverImage={project.cover_image}
          slug={project.slug}
          onChange={(gallery) => updateLocal('gallery', gallery)}
        />
      )}

      {/* ── SEO TAB ──────────────────────────── */}
      {tab === 'seo' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4">SEO Preview</h3>
          <div className="border border-gray-100 rounded p-4 space-y-1">
            <div className="text-blue-600 text-sm">{project.title_en} — ai studio</div>
            <div className="text-emerald-700 text-xs">aistudio.co.uk/works/{project.slug}</div>
            <div className="text-sm text-gray-600 line-clamp-2">{project.description_en || 'No description'}</div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            SEO metadata is auto-generated from the title and description. Edit those in the Content tab.
          </p>
        </div>
      )}

      {/* Floating save */}
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <SaveButton onClick={handleSave} loading={saving} />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete project"
        message={`Are you sure you want to delete "${project.title_en}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </div>
  )
}

// ─── Gallery Sub-component ───────────────────────────
function GalleryEditor({
  gallery,
  coverImage,
  slug,
  onChange,
}: {
  gallery: GalleryImage[]
  coverImage?: string | null
  slug: string
  onChange: (g: GalleryImage[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [orientations, setOrientations] = useState<Record<number, 'vertical' | 'horizontal'>>({})
  const [coverOrientation, setCoverOrientation] = useState<'vertical' | 'horizontal' | null>(null)

  useEffect(() => {
    if (!coverImage) { setCoverOrientation(null); return }
    const img = document.createElement('img')
    img.onload = () => {
      setCoverOrientation(img.naturalHeight >= img.naturalWidth ? 'vertical' : 'horizontal')
    }
    img.src = coverImage
  }, [coverImage])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const newImages: GalleryImage[] = [...gallery]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const idx = String(newImages.length + 1).padStart(2, '0')
      const ext = file.name.split('.').pop()?.toLowerCase().replace('jpeg', 'jpg') || 'jpg'
      const path = `${slug}/${idx}.${ext}`

      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'project-images')
      formData.append('path', path)

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) {
          alert(`Failed to upload ${file.name}: ${data.error || 'Unknown error'}`)
          continue
        }

        newImages.push({ url: data.publicUrl })
      } catch {
        alert(`Failed to upload ${file.name}: network error`)
      }
    }

    onChange(newImages)
    setUploading(false)
  }

  const removeImage = (index: number) => {
    onChange(gallery.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    const updated = [...gallery]
    const [item] = updated.splice(from, 1)
    updated.splice(to, 0, item)
    onChange(updated)
  }

  const toggleHero = (index: number) => {
    const updated = gallery.map((img, i) =>
      i === index ? { ...img, is_hero: !img.is_hero } : img
    )
    onChange(updated)
  }

  const heroCount = gallery.filter((img) => img.is_hero).length

  // Compute slideshow slide numbers: cover image is always slide 1,
  // gallery hero images follow in order.
  let nextSlidePos = 2
  const heroSlidePositions: Record<number, number> = {}
  gallery.forEach((img, i) => {
    if (img.is_hero) {
      heroSlidePositions[i] = nextSlidePos++
    }
  })

  // Warnings: compare cover orientation against gallery hero orientations
  const heroGalleryOrientations = gallery
    .map((img, i) => (img.is_hero ? orientations[i] : undefined))
    .filter((o): o is 'vertical' | 'horizontal' => !!o)

  const hasVerticalHeroes = heroGalleryOrientations.includes('vertical')
  const hasHorizontalHeroes = heroGalleryOrientations.includes('horizontal')

  // Vertical cover + horizontal hero images → letter-box warning
  const showLetterboxWarning = coverOrientation === 'vertical' && hasHorizontalHeroes
  // Horizontal cover + vertical hero images → clip warning
  const showClipWarning = coverOrientation === 'horizontal' && hasVerticalHeroes

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors">
          {uploading ? 'Uploading…' : '+ Add images'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <span className="text-xs text-gray-400">{gallery.length} images</span>
        {heroCount > 0 && (
          <span className={`text-xs ${heroCount > 6 ? 'text-orange-500' : 'text-gray-400'}`}>
            · {heroCount} hero
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        Click ★ on images to add them to the hero slideshow (max 6 recommended). Use arrows to reorder.
        The cover image (Content tab) is always slide 1 and sets the slideshow height.
      </p>

      {/* Slideshow height guidelines */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 space-y-1.5">
        <p className="font-medium text-gray-700">Slideshow height rules</p>
        <p className="text-gray-500">The height is always determined by the cover image:</p>
        <ul className="space-y-1 pl-2 text-gray-600">
          <li>· <span className="font-medium">Vertical cover, all vertical:</span> all images display at 700 px — no issues.</li>
          <li>· <span className="font-medium">Vertical cover + horizontal hero images:</span> horizontal images will be padded with equal empty space above and below to fill the 700 px height.</li>
          <li>· <span className="font-medium">Horizontal cover + vertical hero images:</span> slideshow height = cover&apos;s height; vertical images are centred and will not appear at full height.</li>
        </ul>
      </div>

      {/* Dynamic warnings — only shown when orientation mismatch is detected */}
      {showLetterboxWarning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
          <span className="font-medium">Notice:</span> The cover image is vertical (700 px tall). This slideshow also contains horizontal hero image(s). Horizontal images will appear with equal empty space above and below them to fill the 700 px frame.
        </div>
      )}
      {showClipWarning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
          <span className="font-medium">Notice:</span> The cover image is horizontal, so the slideshow height is less than 700 px. Vertical hero image(s) in this slideshow will be centred within the frame and will not appear at full height.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {gallery.map((img, i) => (
          <div key={i} className="group relative bg-gray-100 rounded overflow-hidden aspect-[3/2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
              onLoad={(e) => {
                const el = e.currentTarget
                const portrait = el.naturalHeight >= el.naturalWidth
                setOrientations((prev) => ({ ...prev, [i]: portrait ? 'vertical' : 'horizontal' }))
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {i > 0 && (
                <button
                  onClick={() => moveImage(i, i - 1)}
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs shadow"
                >
                  ←
                </button>
              )}
              <button
                onClick={() => removeImage(i)}
                className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow"
              >
                ×
              </button>
              {i < gallery.length - 1 && (
                <button
                  onClick={() => moveImage(i, i + 1)}
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs shadow"
                >
                  →
                </button>
              )}
            </div>

            {/* Position number */}
            <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Hero star toggle */}
            <button
              onClick={() => toggleHero(i)}
              title={img.is_hero ? 'Remove from hero' : 'Add to hero slideshow'}
              className={`absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full text-sm
                ${img.is_hero
                  ? 'bg-amber-400 text-white shadow'
                  : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
                }`}
            >
              ★
            </button>

            {/* Orientation badge — helps spot mixed orientations at a glance */}
            {orientations[i] && (
              <div className="absolute bottom-1.5 left-1.5 bg-black/40 text-white text-[9px] px-1 py-0.5 rounded leading-none">
                {orientations[i] === 'vertical' ? '↕ V' : '↔ H'}
              </div>
            )}

            {/* Slideshow slide number — shown on hero images */}
            {img.is_hero && heroSlidePositions[i] && (
              <div className="absolute bottom-1.5 right-1.5 bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded font-medium leading-none">
                Slide {heroSlidePositions[i]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
