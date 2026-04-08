'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BracketLink from '@/components/ui/BracketLink'
import { Project, Lang } from '@/lib/types'
import { getField, t } from '@/lib/i18n'

interface FeaturedItem extends Project {
  slide_image?: string | null
}

interface FeaturedProjectsProps {
  projects: FeaturedItem[]
  lang: Lang
}

export default function FeaturedProjects({ projects, lang }: FeaturedProjectsProps) {
  return (
    <section>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-body-sm text-muted mb-4"
      >
        {t('selected_projects', lang)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="flex gap-2 mb-8 overflow-x-auto"
      >
        {projects.map((project) => {
          const title = getField(project, 'title', lang)
          return (
            <Link
              key={project.id}
              href={`/works/${project.slug}`}
              className="block shrink-0 w-[150px] lg:w-[190px] img-hover-scale group"
            >
              {(project.slide_image || project.cover_image) ? (
                <div className="relative">
                  <Image
                    src={project.slide_image || project.cover_image!}
                    alt={title}
                    width={190}
                    height={140}
                    className="w-full h-[110px] lg:h-[140px] object-cover"
                    sizes="190px"
                  />
                  <div className="absolute inset-0 bg-ink/50 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-cream text-body-sm lowercase leading-tight">{title}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[110px] lg:h-[140px] bg-border flex items-center justify-center">
                  <span className="text-body-sm text-muted lowercase">{title}</span>
                </div>
              )}
            </Link>
          )
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <BracketLink href="/works">
          {t('explore_portfolio', lang)}
        </BracketLink>
        <BracketLink href="/studio#get-in-touch">
          {t('get_in_touch', lang)}
        </BracketLink>
      </motion.div>
    </section>
  )
}
