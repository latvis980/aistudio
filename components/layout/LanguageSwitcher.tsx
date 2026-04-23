'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import { Lang, LANGUAGES } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  currentLang: Lang
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const current = LANGUAGES.find((l) => l.code === currentLang)!

  function switchLang(code: Lang) {
    setCookie('lang', code, { maxAge: 60 * 60 * 24 * 365 })
    setOpen(false)
    router.refresh()
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-nav uppercase tracking-wide-nav text-muted hover:text-ink transition-colors duration-300"
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
        {current.code.toUpperCase()}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full mt-2 end-0 flex flex-col items-end z-50 bg-cream/95 backdrop-blur-sm rounded-md shadow-sm p-1"
          >
            {LANGUAGES.map((lang) => (
              <motion.div key={lang.code} variants={itemVariants}>
                <button
                  onClick={() => switchLang(lang.code)}
                  className={cn(
                    'py-2 px-1 text-nav uppercase tracking-wide-nav transition-colors duration-200',
                    lang.code === currentLang
                      ? 'text-ink'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  {lang.label}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
