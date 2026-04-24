// components/ui/NewsItem.tsx

import Image from 'next/image'
import Link from 'next/link'
import BracketLink from '@/components/ui/BracketLink'
import { NewsItem as NewsItemType, Lang } from '@/lib/types'
import { getField, t } from '@/lib/i18n'
import { formatDate } from '@/lib/utils'

interface NewsItemProps {
  item: NewsItemType
  lang: Lang
}

export default function NewsItemCard({ item, lang }: NewsItemProps) {
  const title = getField(item, 'title', lang)
  const description = getField(item, 'description', lang)
  const thumbnailSrc = item.cover_image
  const hasImage = Boolean(thumbnailSrc)

  return (
    <article className="border-t border-border py-8 last:border-b">
      {/*
        Fixed 2-column grid on ALL rows — image column is always present.
        When there is no image, an invisible spacer of identical dimensions
        holds the column so text is always left-aligned to the same position.

        Column widths: 120px mobile → 160px sm → 180px md+
      */}
      <div className="grid grid-cols-[120px_1fr] gap-6 sm:grid-cols-[160px_1fr] md:grid-cols-[180px_1fr]">

        {/* LEFT — 2:3 portrait thumbnail OR empty spacer */}
        <div>
          {hasImage ? (
            <Link
              href={`/news/${item.slug}`}
              className="block overflow-hidden img-hover-scale"
              tabIndex={-1}
              aria-hidden="true"
            >
              {/* aspect-[2/3] = portrait ratio: height is 1.5× the width */}
              <div className="relative w-full aspect-[2/3]">
                <Image
                  src={thumbnailSrc!}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, 180px"
                />
              </div>
            </Link>
          ) : (
            /* Silent spacer — same dimensions as the thumbnail */
            <div className="w-full aspect-[2/3]" aria-hidden="true" />
          )}
        </div>

        {/* RIGHT — text content */}
        <div className="flex flex-col justify-start">
          {item.date && (
            <p className="text-body-sm text-muted mb-1">
              {formatDate(item.date, lang)}
            </p>
          )}

          <h3 className="text-card-title lowercase leading-snug mb-2">
            <Link
              href={`/news/${item.slug}`}
              className="hover:opacity-70 transition-opacity duration-200"
            >
              {title}
            </Link>
          </h3>

          {description && (
            <p className="text-body text-ink/80 mb-4 line-clamp-3">
              {description}
            </p>
          )}

          {item.external_link ? (
            <BracketLink href={item.external_link} external>
              {t('read_more', lang)}
            </BracketLink>
          ) : (
            <BracketLink href={`/news/${item.slug}`}>
              {t('read_more', lang)}
            </BracketLink>
          )}
        </div>

      </div>
    </article>
  )
}