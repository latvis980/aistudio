'use client'

import { motion } from 'framer-motion'

interface HeroProps {
  tagline: string
  description: string
}

export default function Hero({ tagline, description }: HeroProps) {
  return (
    <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 pt-8 lg:pt-16 pb-24 lg:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="lg:w-1/2"
      >
        <h1 className="text-[2.2rem] lg:text-[3rem] font-light leading-[1.1] tracking-tight">
          ai studio
        </h1>
        <div className="text-[1.3rem] lg:text-[1.7rem] font-light leading-[1.3] text-muted mt-1">
          <div>architecture</div>
          <div>design</div>
          <div>urbanism</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        className="lg:w-1/2 lg:pt-4"
      >
        <h2 className="text-base font-medium mb-4">{tagline}</h2>
        <p className="text-body-sm text-muted">{description}</p>
      </motion.div>
    </section>
  )
}
