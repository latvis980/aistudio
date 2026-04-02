'use client'

import { useState, useRef, useEffect } from 'react'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import { Lang, LANGUAGES } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  currentLang: Lang
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
        className="text-nav uppercase tracking-wide-nav text-muted hover:text-ink transition-colors duration-300"
      >
        {current.code.toUpperCase()}
      </button>

      {open && (
        <div className="absolute top-full mt-2 end-0 bg-cream border border-border rounded-sm py-1 min-w-[120px] shadow-sm z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              className={cn(
                'block w-full text-start px-4 py-1.5 text-body-sm transition-colors duration-200',
                lang.code === currentLang
                  ? 'text-ink font-medium'
                  : 'text-muted hover:text-ink'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
