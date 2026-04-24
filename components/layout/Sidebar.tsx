'use client'

// components/layout/Sidebar.tsx

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import { Lang, LANGUAGES } from '@/lib/types'
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
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState<'burger' | 'lang' | null>(null)

  function switchLang(code: Lang) {
    setCookie('lang', code, { maxAge: 60 * 60 * 24 * 365 })
    setActiveMenu(null)
    router.refresh()
  }

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
            className="w-[126px] h-auto"
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
                whileTap={{ scale: 0.96, opacity: 0.97 }}
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
        <div className="flex items-center justify-between px-5 h-20">
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

          <div className="flex items-center gap-4">
            {/* Language trigger */}
            <button
              onClick={() => setActiveMenu(prev => prev === 'lang' ? null : 'lang')}
              className={cn(
                'flex items-center gap-1.5 text-nav uppercase tracking-wide-nav transition-colors duration-300',
                activeMenu === 'lang' ? 'text-ink' : 'text-muted hover:text-ink'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
              </svg>
              {lang.toUpperCase()}
            </button>

            {/* Burger trigger */}
            <button
              onClick={() => setActiveMenu(prev => prev === 'burger' ? null : 'burger')}
              className="p-2 -me-2"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span
                  className={cn(
                    'block h-[1.5px] bg-ink transition-transform duration-300 origin-center',
                    activeMenu === 'burger' && 'rotate-45 translate-y-[7.5px]'
                  )}
                />
                <span
                  className={cn(
                    'block h-[1.5px] bg-ink transition-opacity duration-300',
                    activeMenu === 'burger' && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'block h-[1.5px] bg-ink transition-transform duration-300 origin-center',
                    activeMenu === 'burger' && '-rotate-45 -translate-y-[7.5px]'
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen overlays ─────────────── */}
      <AnimatePresence>
        {activeMenu === 'burger' && (
          <motion.div
            key="burger-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 z-40 bg-cream/95"
          >
            <nav className="pt-24 px-5 flex flex-col gap-2">
              {NAV_ITEMS.map(({ key, href }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <MotionLink
                    key={key}
                    href={href}
                    onClick={() => setActiveMenu(null)}
                    whileTap={{ scale: 0.97, opacity: 0.97 }}
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
            </nav>
          </motion.div>
        )}

        {activeMenu === 'lang' && (
          <motion.div
            key="lang-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 z-40 bg-cream/95"
          >
            <div className="pt-24 px-5 flex flex-col items-end gap-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => switchLang(language.code)}
                  className={cn(
                    'py-2 px-1 text-nav uppercase tracking-wide-nav transition-colors duration-200',
                    language.code === lang ? 'text-ink' : 'text-muted hover:text-ink'
                  )}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
