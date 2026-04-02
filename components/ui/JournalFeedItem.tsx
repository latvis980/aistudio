import Image from 'next/image'
import Link from 'next/link'
import TagLabel from '@/components/ui/TagLabel'
import BracketLink from '@/components/ui/BracketLink'
import { JournalItem, Lang } from '@/lib/types'
import { t } from '@/lib/i18n'
import { formatDate } from '@/lib/utils'

interface JournalFeedItemProps {
  item: JournalItem
  lang: Lang
}

export default function JournalFeedItem({ item, lang }: JournalFeedItemProps) {
  const href =
    item.type === 'news'
      ? `/news`
      : item.type === 'press'
        ? `/press`
        : `/works/${item.slug}`

  return (
    <article className="py-8 border-b border-border">
      <div className="flex flex-col md:flex-row gap-6">
        {item.cover_image && (
          <div className="md:w-[280px] shrink-0 img-hover-scale">
            <Link href={href}>
              <Image
                src={item.cover_image}
                alt={item.title}
                width={280}
                height={190}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </Link>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TagLabel>{t(item.type === 'works' ? 'works' : item.type, lang)}</TagLabel>
            {item.label && (
              <>
                <span className="text-muted text-body-sm">·</span>
                <span className="text-body-sm text-muted">{item.label}</span>
              </>
            )}
          </div>

          {item.date && (
            <p className="text-body-sm text-muted mb-1">{formatDate(item.date, lang)}</p>
          )}

          <h3 className="text-card-title lowercase mb-2">
            <Link href={href} className="hover:text-accent transition-colors duration-300">
              {item.title}
            </Link>
          </h3>

          {item.description && (
            <p className="text-body text-ink/80 mb-3 line-clamp-2">{item.description}</p>
          )}

          <BracketLink href={href}>{t('read_more', lang)}</BracketLink>
        </div>
      </div>
    </article>
  )
}
