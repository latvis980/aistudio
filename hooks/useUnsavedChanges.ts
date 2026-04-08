'use client'

import { useEffect, useState, useCallback } from 'react'

export function useUnsavedChanges<T>(currentData: T | null) {
  const [initialData, setInitialData] = useState<string | null>(null)

  const isDirty =
    initialData !== null &&
    currentData !== null &&
    JSON.stringify(currentData) !== initialData

  const resetInitialData = useCallback((data: T) => {
    setInitialData(JSON.stringify(data))
  }, [])

  // Warn on tab close / refresh
  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return { isDirty, resetInitialData }
}
