// components/ui/NewsItem.tsx

import Image from 'next/image'
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
  const thumbnailSrc = item.thumbnail_image || item.cover_image

  return (
    <article className="flex flex-col md:flex-row gap-6 py-8 border-b border-border">
      {thumbnailSrc && (
        <div className="md:w-[320px] h-[110px] shrink-0 img-hover-scale relative overflow-hidden">
          <Link href={`/news/${item.slug}`} className="block w-full h-full">
            {item.thumbnail_vertical ? (
              <div style={{ position: 'absolute', width: 110, height: 320, top: -105, left: 105, transform: 'rotate(-90deg)' }}>
                <Image src={thumbnailSrc} alt={title} fill className="object-cover" sizes="320px" />
              </div>
            ) : (
              <Image
                src={thumbnailSrc}
                alt={title}
                width={320}
                height={110}
                className="w-full h-[110px] object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            )}
          </Link>
        </div>
      )}

      <div className="flex-1">
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
      </div>
    </article>
  )
}
