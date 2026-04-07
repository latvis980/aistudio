import Image from 'next/image'
import TagLabel from '@/components/ui/TagLabel'
import BracketLink from '@/components/ui/BracketLink'
import { PressItem, Lang } from '@/lib/types'
import { getField, t } from '@/lib/i18n'

interface PressCardProps {
  item: PressItem
  lang: Lang
}

export default function PressCard({ item, lang }: PressCardProps) {
  const title = getField(item, 'title', lang)
  const description = getField(item, 'description', lang)

  return (
    <article className="flex flex-col md:flex-row gap-6 py-8 border-b border-border">
      {item.cover_image && (
        <div className="md:w-[320px] shrink-0 img-hover-scale">
          <Image
            src={item.cover_image}
            alt={title}
            width={320}
            height={220}
            className="w-full h-auto object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          {item.publication_name && (
            <div className="flex items-center gap-2">
              {item.favicon_url && (
                <Image
                  src={item.favicon_url}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
              )}
              <span className="text-tag uppercase tracking-wide-tag text-ink/70">
                {item.publication_name}
              </span>
            </div>
          )}
          <TagLabel>{t(item.category, lang)}</TagLabel>
        </div>

        <h3 className="text-card-title lowercase mb-2">{title}</h3>

        {description && (
          <p className="text-body text-ink/80 mb-4">{description}</p>
        )}

        <div className="flex gap-4">
          {item.external_link && (
            <BracketLink href={item.external_link} external>
              {t('read_more', lang)}
            </BracketLink>
          )}
          {item.project_id && (
            <BracketLink href={`/works`}>
              {t('project', lang)}
            </BracketLink>
          )}
        </div>
      </div>
    </article>
  )
}
