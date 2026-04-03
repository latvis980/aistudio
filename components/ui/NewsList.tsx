'use client'

import { useState } from 'react'
import NewsItemCard from '@/components/ui/NewsItem'
import { NewsItem, Lang } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NewsListProps {
  items: NewsItem[]
  lang: Lang
}

const PAGE_SIZE = 15

export default function NewsList({ items, lang }: NewsListProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div>
        {paginated.map((item) => (
          <NewsItemCard key={item.id} item={item} lang={lang} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-6 mt-12 pt-8 border-t border-border">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className={cn('bracket-link', page === 1 && 'opacity-30 cursor-not-allowed pointer-events-none')}
          >
            ←
          </button>
          <span className="text-nav text-muted tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
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
