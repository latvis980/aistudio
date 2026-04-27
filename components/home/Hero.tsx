'use client'

// components/home/Hero.tsx

import { motion } from 'framer-motion'

interface HeroProps {
  tagline: string
  description: string
  quote?: string
  quoteAuthor?: string
}

/*
  ALIGNMENT NOTES
  ───────────────
  Left column — all 4 lines share the same visual gap:
    gap = 0.93rem  (= 0.3 × 3.1rem, the leading excess at leading-[1.3] tagline size)
    All items use leading-none so the only spacing is that explicit gap.

  Line heights (lg desktop, leading-none = line-height 1):
    "ai studio"      → 5.4rem
    gap              → 0.93rem
    "architecture"   → 3.1rem
    gap              → 0.93rem
    "design"         ← RIGHT COLUMN HEADER ALIGNS HERE
    gap              → 0.93rem
    "urbanism"

  Right column padding-top (lg):
    5.4 + 0.93 + 3.1 + 0.93 = 10.36rem
*/

const LINE_GAP = '0.93rem'
const RIGHT_COL_PT_LG = '10.36rem'

export default function Hero({ tagline, description, quote, quoteAuthor }: HeroProps) {
  return (
    <section
      className="
        grid grid-cols-1 lg:grid-cols-[1fr_1fr]
        lg:gap-16
        pt-8 lg:pt-16
        pb-8 lg:pb-12
      "
    >
      {/* ── LEFT COLUMN ── unified flex stack, equal gaps between all 4 lines ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col"
        style={{ gap: LINE_GAP }}
      >
        {/* Line 1 */}
        <h1 className="text-[4rem] lg:text-[5.4rem] font-light leading-none tracking-tight">
          ai studio
        </h1>

        {/* Lines 2 – 4: same gap as between h1 and this container */}
        <div
          className="text-[2.3rem] lg:text-[3.1rem] font-light leading-none text-muted flex flex-col"
          style={{ gap: LINE_GAP }}
        >
          <div>architecture</div>
          <div>design</div>
          <div>urbanism</div>
        </div>
      </motion.div>

      {/* ── RIGHT COLUMN ── padded so header aligns with the "design" line ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="mt-8 lg:mt-0"
        style={{
          paddingTop: `clamp(0px, ${RIGHT_COL_PT_LG}, ${RIGHT_COL_PT_LG})`,
        }}
      >
        <h2 className="text-base font-medium mb-4">{tagline}</h2>
        <p className="text-body-sm text-muted leading-relaxed">{description}</p>

        {quote && (
          <blockquote className="mt-8 py-1 border-l border-ink/15 pl-4">
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