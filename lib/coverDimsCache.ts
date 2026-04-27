// lib/coverDimsCache.ts
//
// Tiny sessionStorage cache of natural image dimensions, keyed by URL.
// Used so the project detail page can size its hero frame correctly on first
// paint when arriving from the works feed (where the same image was just
// rendered and its natural dims are already known).

const KEY = 'cover-dims-v1'

export interface CoverDims {
  w: number
  h: number
}

function read(): Record<string, CoverDims> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, CoverDims>) : {}
  } catch {
    return {}
  }
}

export function rememberCoverDims(url: string, dims: CoverDims) {
  if (typeof window === 'undefined' || !url) return
  try {
    const map = read()
    map[url] = dims
    window.sessionStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}

export function getCoverDims(url: string): CoverDims | null {
  if (!url) return null
  const map = read()
  return map[url] ?? null
}
