import Image from 'next/image'
import Link from 'next/link'
import TagLabel from '@/components/ui/TagLabel'
import { Project, Lang } from '@/lib/types'
import { getField, t } from '@/lib/i18n'

interface ProjectCardProps {
  project: Project
  lang: Lang
}

export default function ProjectCard({ project, lang }: ProjectCardProps) {
  const title = getField(project, 'title', lang)
  const location = getField(project, 'location', lang)
  const description = getField(project, 'description', lang)

  return (
    <article className="group">
      <Link href={`/works/${project.slug}`} className="block">
        {project.cover_image && (
          <div className="img-hover-scale mb-4">
            <Image
              src={project.cover_image}
              alt={title}
              width={800}
              height={500}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <h2 className="text-card-title lowercase">{title}</h2>
          <div className="flex gap-3 shrink-0">
            <TagLabel>{t(project.typology, lang)}</TagLabel>
            <TagLabel>{t(project.status, lang)}</TagLabel>
          </div>
        </div>

        {location && (
          <p className="text-body-sm text-muted mb-3">{location}</p>
        )}

        {description && (
          <p className="text-body text-ink/80 max-w-[600px]">{description}</p>
        )}
      </Link>
    </article>
  )
}
