'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lang } from '@/lib/types'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const MotionLink = motion.create(Link)

interface SidebarProps {
  lang: Lang
}

const NAV_ITEMS = [
  { key: 'works', href: '/works' },
  { key: 'press', href: '/press' },
  { key: 'studio', href: '/studio' },
]

export default function Sidebar({ lang }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed top-0 start-0 w-sidebar h-screen z-40 px-8 py-8">
        {/* Logo */}
        <Link href="/" className="block mb-12 group">
          <Image
            src="/images/logo-header.png"
            alt="AI Studio — Architecture · Design · Urbanism"
            width={1743}
            height={417}
            className="w-[140px] h-auto"
            priority
          />
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-4">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <MotionLink
                key={key}
                href={href}
                whileTap={{ scale: 0.96, opacity: 0.85 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className={cn(
                  'text-nav uppercase tracking-wide-nav transition-colors duration-300 origin-left',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                )}
              >
                {t(key, lang)}
              </MotionLink>
            )
          })}
        </nav>
      </aside>

      {/* ── Mobile header ───────────────────────────── */}
      <header className="lg:hidden fixed top-0 start-0 end-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/" className="block">
            <Image
              src="/images/logo-header.png"
              alt="AI Studio"
              width={1743}
              height={417}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 -me-2"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span
                className={cn(
                  'block h-[1.5px] bg-ink transition-transform duration-300 origin-center',
                  mobileOpen && 'rotate-45 translate-y-[4.5px]'
                )}
              />
              <span
                className={cn(
                  'block h-[1.5px] bg-ink transition-opacity duration-300',
                  mobileOpen && 'opacity-0'
                )}
              />
              <span
                className={cn(
                  'block h-[1.5px] bg-ink transition-transform duration-300 origin-center',
                  mobileOpen && '-rotate-45 -translate-y-[4.5px]'
                )}
              />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border"
            >
              <div className="flex flex-col gap-1 px-5 py-4">
                {NAV_ITEMS.map(({ key, href }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <MotionLink
                      key={key}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      whileTap={{ scale: 0.97, opacity: 0.85 }}
                      transition={{ duration: 0.1, ease: 'easeOut' }}
                      className={cn(
                        'text-nav uppercase tracking-wide-nav py-2 transition-colors duration-300 origin-left',
                        isActive ? 'text-ink' : 'text-muted hover:text-ink'
                      )}
                    >
                      {t(key, lang)}
                    </MotionLink>
                  )
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
