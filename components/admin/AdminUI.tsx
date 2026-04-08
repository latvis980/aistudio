'use client'

import { useEffect, useState, useCallback } from 'react'

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
        transition-colors duration-150 focus:outline-none
        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : checked ? 'bg-[#C75B2B]' : 'bg-gray-200'}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm
          transition-transform duration-150
          ${checked ? 'translate-x-5' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  completed:    'bg-green-50 text-green-700 border-green-100',
  construction: 'bg-blue-50 text-blue-700 border-blue-100',
  ongoing:      'bg-amber-50 text-amber-700 border-amber-100',
  concept:      'bg-gray-50 text-gray-600 border-gray-100',
  media:        'bg-purple-50 text-purple-700 border-purple-100',
  interview:    'bg-pink-50 text-pink-700 border-pink-100',
  awards:       'bg-yellow-50 text-yellow-700 border-yellow-100',
  residential:  'bg-teal-50 text-teal-700 border-teal-100',
  office:       'bg-indigo-50 text-indigo-700 border-indigo-100',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-600 border-gray-100'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cls}`}>
      {status}
    </span>
  )
}

// ─── InlineSelect ─────────────────────────────────────────────────────────────
export function InlineSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        px-2 py-1 text-xs border border-gray-200 rounded bg-white
        focus:outline-none focus:border-[#C75B2B] cursor-pointer
        hover:border-gray-300 transition-colors
      "
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

// ─── ProjectPicker ────────────────────────────────────────────────────────────
export function ProjectPicker({
  value,
  onChange,
  projects,
}: {
  value: string | null
  onChange: (v: string | null) => void
  projects: { id: string; title_en: string; slug: string }[]
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`
        w-full max-w-[260px] px-2 py-1 text-xs border rounded bg-white
        focus:outline-none focus:border-[#C75B2B] cursor-pointer
        hover:border-gray-300 transition-colors
        ${value ? 'border-gray-300 text-[#1a1a1a]' : 'border-dashed border-gray-300 text-gray-400'}
      `}
    >
      <option value="">— not linked —</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title_en}
        </option>
      ))}
    </select>
  )
}

// ─── ImageUpload ──────────────────────────────────────────────────────────────
export function ImageUpload({
  bucket,
  currentUrl,
  onUploaded,
  slug,
}: {
  bucket: string
  currentUrl?: string | null
  onUploaded: (url: string) => void
  slug: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop()?.toLowerCase().replace('jpeg', 'jpg') || 'jpg'
    const path = `${slug}/cover.${ext}`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    formData.append('path', path)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        alert(`Upload failed: ${data.error || 'Unknown error'}`)
        setUploading(false)
        return
      }

      onUploaded(data.publicUrl)
    } catch {
      alert('Upload failed: network error')
    }

    setUploading(false)
    // Reset the input so the same file can be re-selected after replace
    e.target.value = ''
  }

  return (
    <div className="flex items-start gap-4">
      {currentUrl ? (
        <div className="w-32 h-20 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-32 h-20 rounded bg-gray-100 border border-dashed border-gray-300 shrink-0 flex items-center justify-center">
          <span className="text-[11px] text-gray-400">No image</span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="
          px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white
          hover:bg-gray-50 cursor-pointer transition-colors inline-block
          disabled:opacity-50
        ">
          {uploading ? 'Uploading…' : currentUrl ? 'Replace image' : 'Upload image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {currentUrl && (
          <p className="text-[11px] text-gray-400 break-all max-w-xs leading-relaxed">
            {decodeURIComponent(currentUrl.split('/').pop() || '')}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── TranslateButton ──────────────────────────────────────────────────────────
export function TranslateButton({
  fields,
  onTranslated,
}: {
  fields: Record<string, string>
  onTranslated: (translations: Record<string, Record<string, string>>) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    // Check there's at least one non-empty field
    const hasContent = Object.values(fields).some((v) => v?.trim())
    if (!hasContent) {
      alert('Fill in at least one English field before translating.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Translation failed (${res.status})`)
      }

      const data = await res.json()
      onTranslated(data.translations)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={loading}
      className="
        flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-md
        bg-white hover:bg-gray-50 transition-colors disabled:opacity-50
        text-gray-600 hover:text-[#1a1a1a]
      "
    >
      <span className="text-[#C75B2B]">✦</span>
      {loading ? 'Translating…' : 'Auto-translate to RU / AR / ZH / ES'}
    </button>
  )
}

// ─── SaveButton ───────────────────────────────────────────────────────────────
export function SaveButton({
  onClick,
  loading,
  isDirty,
}: {
  onClick: () => void
  loading: boolean
  isDirty?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        px-5 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-md
        hover:bg-[#333] transition-colors disabled:opacity-50
      "
    >
      {loading ? 'Saving…' : 'Save'}
      {isDirty && !loading && (
        <span className="inline-block w-1.5 h-1.5 bg-[#C75B2B] rounded-full ml-2 align-middle" />
      )}
    </button>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3
        px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm
        ${type === 'success'
          ? 'bg-[#1a1a1a] text-white'
          : 'bg-red-600 text-white'
        }
      `}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="opacity-60 hover:opacity-100 transition-opacity text-base leading-none ml-1"
      >
        ×
      </button>
    </div>
  )
}

// ─── ConfirmDialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) onCancel()
  }, [onCancel, loading])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-base font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
