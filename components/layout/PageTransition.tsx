'use client'

// components/layout/PageTransition.tsx
//
// Wraps the public layout's children in an AnimatePresence keyed by pathname
// so Framer Motion's layoutId can morph shared elements across routes
// (e.g. the project cover image expanding into the hero on the detail page).
//
// FrozenRouter freezes the LayoutRouterContext for the *exiting* tree so
// Next.js doesn't unmount the previous route mid-animation.

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useContext, useRef, ReactNode } from 'react'
import { Lang } from '@/lib/types'

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext)
  const frozen = useRef(context).current
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  )
}

export default function PageTransition({
  children,
  lang,
}: {
  children: ReactNode
  lang: Lang
}) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={`${pathname}-${lang}`}
        // The entering page is fully opaque so the morphing layoutId image
        // (e.g. project cover → hero) doesn't fade in during its motion.
        // Only the exiting page fades out — header text on the new page
        // animates in via its own StaggerReveal.
        // Exit duration is slightly longer than the layoutId morph (0.45s)
        // so the source element remains mounted until the morph settles.
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  )
}
