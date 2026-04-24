'use client'

// app/(public)/journal/JournalFeed.tsx

import { useState } from 'react'
import { JournalItem, Lang } from '@/lib/types'
import JournalFeedItem from '@/components/ui/JournalFeedItem'
import { t } from '@/lib/i18n'

interface JournalFeedProps {
  items: JournalItem[]
  lang: Lang
}

const PAGE_SIZE = 15

export default function JournalFeed({ items, lang }: JournalFeedProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  if (items.length === 0) {
    return <p className="text-muted text-body">No journal entries yet.</p>
  }

  return (
    <>
      <div>
        {visible.map((item, i) => (
          <JournalFeedItem key={`${item.type}-${item.slug}-${i}`} item={item} lang={lang} />
        ))}
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
