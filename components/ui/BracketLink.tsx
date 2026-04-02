'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BracketLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  active?: boolean
}

export default function BracketLink({
  href,
  children,
  className,
  external = false,
  active = false,
}: BracketLinkProps) {
  const classes = cn(
    'bracket-link',
    active && 'text-ink',
    className
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
