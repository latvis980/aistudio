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
  projectSlugs?: Record<string, string>
}

const TABS = ['featured', 'all', 'media', 'interview', 'awards'] as const
const PAGE_SIZE = 15

export default function PressFilter({ items, lang, initialCategory, projectSlugs }: PressFilterProps) {
  const [activeTab, setActiveTab] = useState(initialCategory || 'featured')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items
    if (activeTab === 'featured') return items.filter((i) => i.is_featured)
    return items.filter((i) => i.category === activeTab)
  }, [items, activeTab])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function changeTab(tab: string) {
    setActiveTab(tab)
    setVisibleCount(PAGE_SIZE)
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
          {visible.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <PressCard item={item} lang={lang} projectSlugs={projectSlugs} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-body text-muted py-12 text-center">No press items found.</p>
        )}
      </div>

      {hasMore && (
        <div className="mt-12 pt-8 border-t border-border">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="bracket-link"
          >
            {t('load_more', lang)}
          </button>
        </div>
      )}
    </>
  )
}
