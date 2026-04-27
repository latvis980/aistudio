'use client'

// components/ui/ProjectCard.tsx

import { useRef } from 'react'
import TagLabel from '@/components/ui/TagLabel'
import CoverImage from '@/components/ui/CoverImage'
import { Project, Lang } from '@/lib/types'
import { getField, t } from '@/lib/i18n'

interface ProjectCardProps {
  project: Project
  lang: Lang
  /** Called instead of navigating — parent runs the transition animation */
  onOpen: (project: Project, imageEl: HTMLElement) => void
}

export default function ProjectCard({ project, lang, onOpen }: ProjectCardProps) {
  const title       = getField(project, 'title', lang)
  const location    = getField(project, 'location', lang)
  const description = getField(project, 'description', lang)
  const imageRef    = useRef<HTMLDivElement>(null)

  function handleClick() {
    if (imageRef.current) {
      onOpen(project, imageRef.current)
    }
  }

  return (
    <article
      className="group cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      aria-label={title}
    >
      {project.cover_image && (
        <div ref={imageRef} className="img-hover-scale mb-4">
          <CoverImage src={project.cover_image} alt={title} />
        </div>
      )}

      <div className="flex gap-3 mb-1">
        <TagLabel plain>{t(project.typology, lang)}</TagLabel>
        <TagLabel plain>{t(project.status, lang)}</TagLabel>
      </div>

      <h2 className="text-[2.24rem] leading-[1.35] font-light lowercase group-hover:text-accent transition-colors duration-300 mb-2">
        {title}
      </h2>

      {location && (
        <p className="text-body-sm text-muted mb-3">{location}</p>
      )}

      {description && (
        <p className="text-body text-ink/80 max-w-[600px]">{description}</p>
      )}
    </article>
  )
}
