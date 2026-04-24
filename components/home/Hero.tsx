'use client'

// components/home/Hero.tsx

import { motion } from 'framer-motion'

interface HeroProps {
  tagline: string
  description: string
  quote?: string
  quoteAuthor?: string
}

export default function Hero({ tagline, description, quote, quoteAuthor }: HeroProps) {
  return (
    <section className="
      grid
      grid-cols-1
      lg:grid-cols-2
      lg:gap-16
      pt-8 lg:pt-16
      pb-8 lg:pb-12
    ">
      {/*
        LEFT COLUMN — split into two explicit rows:
          Row 1: "ai studio" heading
          Row 2: "architecture / design / urbanism" tagwords
      */}

      {/* Row 1, Left — "ai studio" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="lg:col-start-1 lg:row-start-1"
      >
        <h1 className="text-[4rem] lg:text-[5.4rem] font-light leading-[1.1] tracking-tight">
          ai studio
        </h1>
      </motion.div>

      {/* Row 2, Left — "architecture / design / urbanism" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="lg:col-start-1 lg:row-start-2"
      >
        <div className="text-[2.3rem] lg:text-[3.1rem] font-light leading-[1.3] text-muted">
          <div>architecture</div>
          <div>design</div>
          <div>urbanism</div>
        </div>
      </motion.div>

      {/*
        RIGHT COLUMN — pinned to Row 2 only.
        This makes the top of this block align exactly with "architecture"
        in the left column — no padding guesswork needed.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="lg:col-start-2 lg:row-start-2 mt-6 lg:mt-0"
      >
        <h2 className="text-base font-medium mb-4">{tagline}</h2>
        <p className="text-body-sm text-muted">{description}</p>

        {quote && (
          <blockquote className="mt-8 py-1">
            <p className="text-body-sm italic text-muted/80 leading-relaxed">
              &ldquo;{quote}&rdquo;
            </p>
            {quoteAuthor && (
              <footer className="mt-3 text-body-sm text-muted/60">
                {quoteAuthor}
              </footer>
            )}
          </blockquote>
        )}
      </motion.div>
    </section>
  )
}