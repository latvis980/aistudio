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

export default function PressFilter({ items, lang, initialCategory }: PressFilterProps) {
  const [activeTab, setActiveTab] = useState(initialCategory || 'all')

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items
    if (activeTab === 'featured') return items.filter((i) => i.is_featured)
    return items.filter((i) => i.category === activeTab)
  }, [items, activeTab])

  return (
    <>
      <div className="flex gap-4 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'text-nav uppercase tracking-wide-nav transition-colors duration-300',
              activeTab === tab ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            {t(tab === 'interview' ? 'interviews' : tab, lang)}
          </button>
        ))}
      </div>

      <div>
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
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
    </>
  )
}
