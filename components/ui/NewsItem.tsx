import Link from 'next/link'
import BracketLink from '@/components/ui/BracketLink'
import { NewsItem as NewsItemType, Lang } from '@/lib/types'
import { getField, t } from '@/lib/i18n'

interface NewsItemProps {
  item: NewsItemType
  lang: Lang
}

export default function NewsItemCard({ item, lang }: NewsItemProps) {
  const title = getField(item, 'title', lang)
  const description = getField(item, 'description', lang)

  return (
    <article className="py-8 border-b border-border">
      <h3 className="text-card-title lowercase mb-2">
        <Link href={`/news/${item.slug}`} className="hover:text-accent transition-colors duration-300">
          {title}
        </Link>
      </h3>
      {description && (
        <p className="text-body text-ink/80 mb-4">{description}</p>
      )}
      {item.external_link && (
        <BracketLink href={item.external_link} external>
          {t('read_more', lang)}
        </BracketLink>
      )}
    </article>
  )
}
