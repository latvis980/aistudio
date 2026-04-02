'use client'

import { JournalItem, Lang } from '@/lib/types'
import JournalFeedItem from '@/components/ui/JournalFeedItem'

interface JournalFeedProps {
  items: JournalItem[]
  lang: Lang
}

export default function JournalFeed({ items, lang }: JournalFeedProps) {
  if (items.length === 0) {
    return <p className="text-muted text-body">No journal entries yet.</p>
  }

  return (
    <div>
      {items.map((item, i) => (
        <JournalFeedItem key={`${item.type}-${item.slug}-${i}`} item={item} lang={lang} />
      ))}
    </div>
  )
}
