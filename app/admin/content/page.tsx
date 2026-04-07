'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SiteContent, LANGUAGES } from '@/lib/types'
import { TranslateButton, SaveButton, Toast } from '@/components/admin/AdminUI'

// ─── Content block metadata ───────────────────────────────────────────────────
const CONTENT_BLOCKS: {
  key: string
  label: string
  description: string
  href: string
  rows: number
}[] = [
  {
    key: 'home_tagline',
    label: 'Home — Tagline',
    description: 'Short headline shown on the homepage hero',
    href: '/',
    rows: 2,
  },
  {
    key: 'home_description',
    label: 'Home — Description',
    description: 'Introductory text beneath the tagline on the homepage',
    href: '/',
    rows: 4,
  },
  {
    key: 'about',
    label: 'Studio — About',
    description: 'Main studio description on the Studio page',
    href: '/studio',
    rows: 8,
  },
  {
    key: 'founder',
    label: 'Studio — Founder',
    description: 'Founder bio section on the Studio page',
    href: '/studio',
    rows: 8,
  },
  {
    key: 'privacy_policy',
    label: 'Privacy Policy',
    description: 'Full privacy policy text',
    href: '/privacy-policy',
    rows: 12,
  },
  {
    key: 'cookie_policy',
    label: 'Cookie Policy',
    description: 'Full cookie policy text',
    href: '/cookie-policy',
    rows: 12,
  },
]

// ─── Single content block editor ──────────────────────────────────────────────
function ContentBlock({
  blockMeta,
  initialData,
  onSaved,
}: {
  blockMeta: (typeof CONTENT_BLOCKS)[number]
  initialData: SiteContent | null
  onSaved: (updated: SiteContent) => void
}) {
  const [item, setItem] = useState<SiteContent | null>(
    initialData ?? {
      id: '',
      page_key: blockMeta.key,
      content_en: null,
      content_ru: null,
      content_ar: null,
      content_zh: null,
      content_es: null,
      updated_at: '',
    }
  )
  const [isNew, setIsNew] = useState(!initialData)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [expanded, setExpanded] = useState(!!initialData)

  const updateField = (field: string, value: string) => {
    if (!item) return
    setItem({ ...item, [field]: value } as SiteContent)
  }

  const handleSave = async () => {
    if (!item) return
    setSaving(true)

    const payload = {
      page_key: item.page_key,
      content_en: item.content_en,
      content_ru: item.content_ru,
      content_ar: item.content_ar,
      content_zh: item.content_zh,
      content_es: item.content_es,
    }

    const result = isNew
      ? await supabase.from('site_content').insert(payload).select().single()
      : await supabase.from('site_content').update(payload).eq('id', item.id).select().single()

    setSaving(false)

    if (result.error) {
      setToast({ message: `Save failed: ${result.error.message}`, type: 'error' })
    } else {
      const saved = result.data as SiteContent
      setItem(saved)
      if (isNew) setIsNew(false)
      setToast({ message: 'Saved', type: 'success' })
      onSaved(saved)
      setTimeout(() => setToast(null), 2000)
    }
  }

  const handleTranslated = (translations: Record<string, Record<string, string>>) => {
    if (!item) return
    const updated = { ...item } as Record<string, unknown>
    for (const [, langs] of Object.entries(translations)) {
      for (const [lang, text] of Object.entries(langs)) {
        updated[`content_${lang}`] = text
      }
    }
    setItem(updated as unknown as SiteContent)
    setToast({ message: 'Translations filled — review and save', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{blockMeta.label}</span>
          <a
            href={blockMeta.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-gray-400 hover:text-[#C75B2B] transition-colors"
          >
            ↗ {blockMeta.href}
          </a>
        </div>
        <div className="flex items-center gap-3">
          {item?.content_en && (
            <span className="text-[11px] text-gray-400 hidden sm:block max-w-[200px] truncate">
              {item.content_en.slice(0, 60)}{item.content_en.length > 60 ? '…' : ''}
            </span>
          )}
          {!item?.content_en && (
            <span className="text-[11px] text-amber-500">empty</span>
          )}
          <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Body */}
      {expanded && item && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          <p className="text-xs text-gray-400">{blockMeta.description}</p>

          {/* Translate */}
          <TranslateButton
            fields={{ content: item.content_en || '' }}
            onTranslated={handleTranslated}
          />

          {/* Language fields */}
          <div className="space-y-4">
            {LANGUAGES.map(({ code, label }) => (
              <div key={code}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {label}
                </label>
                <textarea
                  value={(item as unknown as Record<string, unknown>)[`content_${code}`] as string || ''}
                  onChange={(e) => updateField(`content_${code}`, e.target.value)}
                  dir={code === 'ar' ? 'rtl' : 'ltr'}
                  rows={blockMeta.rows}
                  className="
                    w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-y
                    focus:outline-none focus:ring-1 focus:ring-[#C75B2B]/30 focus:border-[#C75B2B]
                    font-mono leading-relaxed
                  "
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <SaveButton onClick={handleSave} loading={saving} />
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContentPage() {
  const [contentMap, setContentMap] = useState<Record<string, SiteContent>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const keys = CONTENT_BLOCKS.map((b) => b.key)
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .in('page_key', keys)

    const map: Record<string, SiteContent> = {}
    for (const row of data || []) {
      map[row.page_key] = row as SiteContent
    }
    setContentMap(map)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSaved = (updated: SiteContent) => {
    setContentMap((prev) => ({ ...prev, [updated.page_key]: updated }))
  }

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Site Content</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage multilingual text for static pages across the site.
        </p>
      </div>

      <div className="space-y-3">
        {CONTENT_BLOCKS.map((block) => (
          <ContentBlock
            key={block.key}
            blockMeta={block}
            initialData={contentMap[block.key] ?? null}
            onSaved={handleSaved}
          />
        ))}
      </div>
    </div>
  )
}
