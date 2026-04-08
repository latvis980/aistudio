'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PressCard from '@/components/ui/PressCard'
import { PressItem, Lang } from '@/lib/types'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface PressFilterProps {
  items: PressItem[]
  lang: Lang
  initialCategory?: string
}

const TABS = ['all', 'featured', 'media', 'interview', 'awards'] as const
const PAGE_SIZE = 15

export default function PressFilter({ items, lang, initialCategory }: PressFilterProps) {
  const [activeTab, setActiveTab] = useState(initialCategory || 'all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items
    if (activeTab === 'featured') return items.filter((i) => i.is_featured)
    return items.filter((i) => i.category === activeTab)
  }, [items, activeTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeTab(tab: string) {
    setActiveTab(tab)
    setPage(1)
  }

  return (
    <>
      <div className="flex gap-4 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => changeTab(tab)}
            className={cn(
              'text-nav uppercase tracking-wide-nav transition-colors duration-300',
              activeTab === tab ? 'text-ink hover:text-accent' : 'text-muted hover:text-ink'
            )}
          >
            {t(tab === 'interview' ? 'interviews' : tab, lang)}
          </button>
        ))}
      </div>

      <div>
        <AnimatePresence mode="popLayout">
          {paginated.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <PressCard item={item} lang={lang} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-body text-muted py-12 text-center">No press items found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-6 mt-12 pt-8 border-t border-border">
          <button
            onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            disabled={page === 1}
            className={cn('bracket-link', page === 1 && 'opacity-30 cursor-not-allowed pointer-events-none')}
          >
            ←
          </button>
          <span className="text-nav text-muted tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            disabled={page === totalPages}
            className={cn('bracket-link', page === totalPages && 'opacity-30 cursor-not-allowed pointer-events-none')}
          >
            →
          </button>
        </div>
      )}
    </>
  )
}
