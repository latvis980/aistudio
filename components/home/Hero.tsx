'use client'

import { motion } from 'framer-motion'

interface HeroProps {
  tagline: string
  description: string
  quote?: string
  quoteAuthor?: string
}

export default function Hero({ tagline, description, quote, quoteAuthor }: HeroProps) {
  return (
    <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 pt-8 lg:pt-16 pb-8 lg:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="lg:w-1/2"
      >
        <h1 className="text-[4rem] lg:text-[5.4rem] font-light leading-[1.1] tracking-tight">
          ai studio
        </h1>
        <div className="text-[2.3rem] lg:text-[3.1rem] font-light leading-[1.3] text-muted mt-1">
          <div>architecture</div>
          <div>design</div>
          <div>urbanism</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        className="lg:w-1/2 lg:pt-[6.19rem]"
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
