'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { HomepageSlide } from '@/lib/types'
import { ProjectPicker, ImageUpload, Toast } from '@/components/admin/AdminUI'

interface SlideRow extends HomepageSlide {
  projects?: { id: string; title_en: string; slug: string } | null
}

const MAX_SLIDES = 6

export default function HomepageAdmin() {
  const [slides, setSlides] = useState<SlideRow[]>([])
  const [projects, setProjects] = useState<{ id: string; title_en: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase
        .from('homepage_slides')
        .select('*, projects(id, title_en, slug)')
        .order('display_order', { ascending: true }),
      supabase
        .from('projects')
        .select('id, title_en, slug')
        .order('title_en', { ascending: true }),
    ])
    setSlides((s as SlideRow[]) || [])
    setProjects(p || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Add slide ────────────────────────────────────────
  const addSlide = async () => {
    if (slides.length >= MAX_SLIDES) return
    if (!projects.length) {
      setToast({ message: 'No projects available', type: 'error' })
      return
    }

    const { error } = await supabase
      .from('homepage_slides')
      .insert({ project_id: projects[0].id, display_order: slides.length })

    if (error) {
      setToast({ message: `Failed to add slide: ${error.message}`, type: 'error' })
      return
    }
    setToast({ message: 'Slide added', type: 'success' })
    load()
  }

  // ── Remove slide ─────────────────────────────────────
  const removeSlide = async (id: string) => {
    const { error } = await supabase.from('homepage_slides').delete().eq('id', id)
    if (error) {
      setToast({ message: `Failed to remove: ${error.message}`, type: 'error' })
      return
    }
    // Re-number remaining slides
    const remaining = slides.filter((s) => s.id !== id)
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].display_order !== i) {
        await supabase.from('homepage_slides').update({ display_order: i }).eq('id', remaining[i].id)
      }
    }
    setToast({ message: 'Slide removed', type: 'success' })
    load()
  }

  // ── Update project ──────────────────────────────────
  const updateProject = async (id: string, projectId: string | null) => {
    if (!projectId) return
    const { error } = await supabase
      .from('homepage_slides')
      .update({ project_id: projectId })
      .eq('id', id)
    if (error) {
      setToast({ message: `Failed to update: ${error.message}`, type: 'error' })
      return
    }
    setSlides((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, project_id: projectId, projects: projects.find((p) => p.id === projectId) || null }
          : s,
      ),
    )
    setToast({ message: 'Project updated', type: 'success' })
  }

  // ── Update image ────────────────────────────────────
  const updateImage = async (id: string, url: string) => {
    const { error } = await supabase
      .from('homepage_slides')
      .update({ image_url: url })
      .eq('id', id)
    if (error) {
      setToast({ message: `Failed to save image: ${error.message}`, type: 'error' })
      return
    }
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, image_url: url } : s)))
    setToast({ message: 'Image updated', type: 'success' })
  }

  // ── Reorder ─────────────────────────────────────────
  const swap = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= slides.length) return

    const a = slides[index]
    const b = slides[target]

    await Promise.all([
      supabase.from('homepage_slides').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('homepage_slides').update({ display_order: a.display_order }).eq('id', b.id),
    ])

    const updated = [...slides]
    updated[index] = { ...b, display_order: a.display_order }
    updated[target] = { ...a, display_order: b.display_order }
    updated.sort((x, y) => x.display_order - y.display_order)
    setSlides(updated)
    setToast({ message: 'Order updated', type: 'success' })
  }

  if (loading) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1a1a1a]">Homepage Slides</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage featured project slides on the homepage. Max {MAX_SLIDES} slides.
          </p>
        </div>
        <button
          onClick={addSlide}
          disabled={slides.length >= MAX_SLIDES}
          className="
            px-4 py-2 text-xs font-medium bg-[#1a1a1a] text-white rounded-md
            hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          + Add slide
        </button>
      </div>

      {/* Slides */}
      {slides.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-sm text-gray-400 mb-3">No slides yet</p>
          <button
            onClick={addSlide}
            className="text-xs text-[#C75B2B] hover:underline"
          >
            Add your first slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              {/* Top row: order + project + remove */}
              <div className="flex items-center gap-3 mb-3">
                {/* Order controls */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => swap(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-[#1a1a1a] disabled:opacity-20 text-xs leading-none"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => swap(i, 1)}
                    disabled={i === slides.length - 1}
                    className="text-gray-400 hover:text-[#1a1a1a] disabled:opacity-20 text-xs leading-none"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Slide number */}
                <span className="text-xs text-gray-400 font-mono w-6 text-center shrink-0">
                  {i + 1}
                </span>

                {/* Project picker */}
                <div className="flex-1">
                  <ProjectPicker
                    value={slide.project_id}
                    projects={projects}
                    onChange={(v) => updateProject(slide.id, v)}
                  />
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeSlide(slide.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>

              {/* Image upload */}
              <div className="pl-10">
                <ImageUpload
                  bucket="homepage-images"
                  currentUrl={slide.image_url}
                  onUploaded={(url) => updateImage(slide.id, url)}
                  slug={`slide-${slide.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
