'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lang } from '@/lib/types'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface SidebarProps {
  lang: Lang
}

const NAV_ITEMS = [
  { key: 'works', href: '/works' },
  { key: 'press', href: '/press' },
  { key: 'studio', href: '/studio' },
  { key: 'contact', href: '/contact' },
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
          <div className="text-[1.6rem] font-medium tracking-tight leading-none">
            ai<span className="text-accent">/</span>studio
          </div>
          <div className="text-[0.5rem] uppercase tracking-[0.25em] text-muted mt-1.5">
            Architecture · Design · Urbanism
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-4">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'text-nav uppercase tracking-wide-nav transition-colors duration-300',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                )}
              >
                {t(key, lang)}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Mobile header ───────────────────────────── */}
      <header className="lg:hidden fixed top-0 start-0 end-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/" className="text-xl font-medium tracking-tight">
            ai<span className="text-accent">/</span>studio
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
                    <Link
                      key={key}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'text-nav uppercase tracking-wide-nav py-2 transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-muted hover:text-ink'
                      )}
                    >
                      {t(key, lang)}
                    </Link>
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
