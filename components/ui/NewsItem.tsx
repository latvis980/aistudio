import Image from 'next/image'
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
      <div className="flex flex-col md:flex-row gap-6">
        {item.cover_image && (
          <div className="md:w-[400px] shrink-0 img-hover-scale">
            <Image
              src={item.cover_image}
              alt={title}
              width={400}
              height={280}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-card-title lowercase mb-2">{title}</h3>
          {description && (
            <p className="text-body text-ink/80 mb-4">{description}</p>
          )}
          {item.external_link && (
            <BracketLink href={item.external_link} external>
              {t('read_more', lang)}
            </BracketLink>
          )}
        </div>
      </div>
    </article>
  )
}
