'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard from '@/components/ui/ProjectCard'
import { Project, Lang, Typology, Status } from '@/lib/types'
import { t, getField } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface WorksFilterProps {
  projects: Project[]
  lang: Lang
  initialTypology?: string
}

const TYPOLOGIES: Typology[] = [
  'residential', 'office', 'public', 'hospitality', 'mixed-use', 'masterplan', 'interior',
]
const STATUSES: Status[] = ['completed', 'ongoing', 'concept']

const PAGE_SIZE = 15

export default function WorksFilter({ projects, lang, initialTypology }: WorksFilterProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialTypology || 'featured')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    let result = projects

    if (activeFilter === 'featured') {
      result = result.filter((p) => p.is_featured)
    } else if (TYPOLOGIES.includes(activeFilter as Typology)) {
      result = result.filter((p) => p.typology === activeFilter)
    } else if (STATUSES.includes(activeFilter as Status)) {
      result = result.filter((p) => p.status === activeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) => {
        const title = getField(p, 'title', lang).toLowerCase()
        const desc = getField(p, 'description', lang).toLowerCase()
        const loc = getField(p, 'location', lang).toLowerCase()
        return title.includes(q) || desc.includes(q) || loc.includes(q)
      })
    }

    return result
  }, [projects, activeFilter, search, lang])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function changeFilter(value: string) {
    setActiveFilter(value)
    setVisibleCount(PAGE_SIZE)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setVisibleCount(PAGE_SIZE)
  }

  function FilterButton({ value, label }: { value: string; label: string }) {
    const isActive = activeFilter === value
    return (
      <button
        onClick={() => changeFilter(value)}
        className={cn(
          'text-tag uppercase tracking-wide-tag transition-colors duration-300 text-start',
          isActive ? 'text-ink font-medium hover:text-accent' : 'text-muted hover:text-ink'
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      <aside className="lg:w-[180px] shrink-0">
        <div className="flex flex-col gap-3 lg:sticky lg:top-8">
          <FilterButton value="featured" label={t('featured', lang)} />
          <FilterButton value="all" label={t('all', lang)} />

          <div className="mt-4 mb-1">
            <span className="text-nav uppercase tracking-wide-nav text-ink">
              {t('typology', lang)}
            </span>
          </div>
          {TYPOLOGIES.map((typ) => (
            <FilterButton key={typ} value={typ} label={t(typ, lang)} />
          ))}

          <div className="mt-4 mb-1">
            <span className="text-nav uppercase tracking-wide-nav text-ink">
              {t('status_label', lang)}
            </span>
          </div>
          {STATUSES.map((status) => (
            <FilterButton key={status} value={status} label={t(status, lang)} />
          ))}

          <input
            type="text"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder={t('search', lang)}
            className="bg-transparent border-b border-muted text-body-sm text-ink
                       placeholder:text-muted focus:border-ink focus:outline-none
                       transition-colors duration-300 pb-1 w-full mt-4"
          />
        </div>
      </aside>

      <div className="flex-1 max-w-[700px]">
        <div className="flex flex-col gap-16">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={project} lang={lang} />
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-body text-muted py-12 text-center">
              No projects found.
            </p>
          )}
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
      </div>
    </div>
  )
}
