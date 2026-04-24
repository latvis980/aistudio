'use client'

// components/ui/NewsList.tsx

import { useState } from 'react'
import NewsItemCard from '@/components/ui/NewsItem'
import { NewsItem, Lang } from '@/lib/types'
import { t } from '@/lib/i18n'

interface NewsListProps {
  items: NewsItem[]
  lang: Lang
}

const PAGE_SIZE = 15

export default function NewsList({ items, lang }: NewsListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <>
      <div>
        {visible.map((item) => (
          <NewsItemCard key={item.id} item={item} lang={lang} />
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
