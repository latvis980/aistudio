'use client'

// components/ui/WorksFilter.tsx

import { useState, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
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

// Easing curves matching the approved mockup
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)'

export default function WorksFilter({ projects, lang, initialTypology }: WorksFilterProps) {
  const router = useRouter()

  const [activeFilter, setActiveFilter] = useState<string>(initialTypology || 'featured')
  const [search, setSearch]             = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Used to collapse the filter panel during transition
  const [filterCollapsed, setFilterCollapsed] = useState(false)

  const filterRef = useRef<HTMLElement>(null)
  const ghostRef  = useRef<HTMLDivElement>(null)

  // ── Filtered + paginated list ──────────────────────────────────────────
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
        const desc  = getField(p, 'description', lang).toLowerCase()
        const loc   = getField(p, 'location', lang).toLowerCase()
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

  // ── Transition animation ───────────────────────────────────────────────
  const openProject = useCallback((project: Project, imageEl: HTMLElement) => {
    const ghost = ghostRef.current
    if (!ghost) {
      // Fallback: just navigate with no animation
      router.push(`/works/${project.slug}`)
      return
    }

    // 1. Snapshot image position & size BEFORE the DOM shifts
    const rect = imageEl.getBoundingClientRect()

    // 2. Set up ghost at the exact same position
    //    Use the project's cover image as the ghost content
    ghost.innerHTML = project.cover_image
      ? `<img src="${project.cover_image}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />`
      : `<div style="width:100%;height:100%;background:#d0cbc3;"></div>`

    Object.assign(ghost.style, {
      display:    'block',
      position:   'fixed',
      top:        `${rect.top}px`,
      left:       `${rect.left}px`,
      width:      `${rect.width}px`,
      height:     `${rect.height}px`,
      opacity:    '1',
      transition: 'none',
      overflow:   'hidden',
      zIndex:     '50',
      pointerEvents: 'none',
    })

    // 3. Hide the real image — ghost takes over visually
    imageEl.style.opacity = '0'

    // 4. Collapse the filter panel (triggers CSS transition via state)
    setFilterCollapsed(true)

    // How far to slide: the filter panel's current rendered width.
    // We read it from the DOM so it works even if screen size varies.
    const filterWidth = filterRef.current
      ? filterRef.current.getBoundingClientRect().width
      : 180

    // 5. On next two frames (after paint), animate ghost left
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Object.assign(ghost.style, {
          transition: `left 540ms ${EASE_IN_OUT}, opacity 200ms ease 520ms`,
          left:       `${rect.left - filterWidth}px`,
          opacity:    '0', // fades out as it arrives — no pop on page change
        })
      })
    })

    // 6. Navigate once animation is complete.
    //    No cleanup needed — the component unmounts on navigation,
    //    so React discards all state automatically. Resetting state
    //    here would cause the filter to snap back open while the
    //    old page is still visible during the Next.js transition.
    setTimeout(() => {
      router.push(`/works/${project.slug}`)
    }, 560)
  }, [router])

  // ── Render ─────────────────────────────────────────────────────────────
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
    <>
      {/*
        Ghost element: a fixed-position image clone that slides left during
        the transition. Lives outside the layout flow so it's unaffected by
        the filter collapse reflow.
      */}
      <div ref={ghostRef} style={{ display: 'none' }} aria-hidden="true" />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
        {/* ── Filter sidebar ── */}
        <aside
          ref={filterRef}
          style={filterCollapsed ? {
            width: '0',
            opacity: '0',
            overflow: 'hidden',
            padding: '0',
            transition: `width 540ms ${EASE_IN_OUT}, opacity 280ms ease, padding 540ms ${EASE_IN_OUT}`,
          } : {
            transition: `width 540ms ${EASE_IN_OUT}, opacity 280ms ease, padding 540ms ${EASE_IN_OUT}`,
          }}
          className="lg:w-[180px] shrink-0"
        >
          <div className="flex flex-col gap-3 lg:sticky lg:top-8">
            <FilterButton value="featured" label={t('featured', lang)} />
            <FilterButton value="all"      label={t('all',      lang)} />

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

        {/* ── Project feed ── */}
        <div className="flex-1 max-w-[700px] lg:ps-16">
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
                  <ProjectCard
                    project={project}
                    lang={lang}
                    onOpen={openProject}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <p className="text-body text-muted py-12 text-center">
                {t('no_projects_found', lang) ?? 'No projects found.'}
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
    </>
  )
}
