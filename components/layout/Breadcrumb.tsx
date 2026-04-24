// components/layout/Breadcrumb.tsx

import BracketLink from '@/components/ui/BracketLink'
import { Lang } from '@/lib/types'
import { t } from '@/lib/i18n'

export interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbProps {
  crumbs: Crumb[]
  lang: Lang
}

export default function Breadcrumb({ crumbs, lang }: BreadcrumbProps) {
  const allCrumbs: Crumb[] = [
    { label: t('home', lang), href: '/' },
    ...crumbs,
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 mb-8">
      {allCrumbs.map((crumb, i) => {
        const isLast = i === allCrumbs.length - 1
        if (isLast || !crumb.href) {
          return (
            <BracketLink key={i} href="#" active className="pointer-events-none">
              {crumb.label}
            </BracketLink>
          )
        }
        return (
          <BracketLink key={i} href={crumb.href}>
            {crumb.label}
          </BracketLink>
        )
      })}
    </div>
  )
}
