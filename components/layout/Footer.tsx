import Link from 'next/link'
import BracketLink from '@/components/ui/BracketLink'
import { Lang } from '@/lib/types'
import { t } from '@/lib/i18n'

interface FooterProps {
  lang: Lang
}

export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="mt-24">
      <div className="divider" />

      <div className="py-12 flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left column — email + socials */}
        <div className="flex flex-col gap-3 lg:min-w-[260px]">
          <a
            href="mailto:office@aistudio.co.uk"
            className="text-accent hover:text-accent/80 transition-colors duration-300 text-body"
          >
            office@aistudio.co.uk
          </a>
          <div className="flex flex-col gap-1">
            <BracketLink href="https://t.me/" external>
              Telegram
            </BracketLink>
            <BracketLink href="https://linkedin.com/" external>
              LinkedIn
            </BracketLink>
          </div>
        </div>

        {/* Right columns — sitemap */}
        <div className="flex flex-wrap gap-x-16 gap-y-8 text-body-sm">
          {/* Works */}
          <div>
            <div className="text-nav uppercase tracking-wide-nav text-ink mb-3">
              {t('works', lang)}
            </div>
            <div className="flex flex-col gap-1.5">
              {['residential', 'office', 'public', 'hospitality', 'mixed-use', 'masterplan', 'interior'].map(
                (typ) => (
                  <Link
                    key={typ}
                    href={`/works?typology=${typ}`}
                    className="text-muted hover:text-ink transition-colors duration-300 uppercase text-tag tracking-wide-tag"
                  >
                    {t(typ, lang)}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Press */}
          <div>
            <div className="text-nav uppercase tracking-wide-nav text-ink mb-3">
              {t('press', lang)}
            </div>
            <div className="flex flex-col gap-1.5">
              {['media', 'interviews', 'awards'].map((cat) => (
                <Link
                  key={cat}
                  href={`/press?category=${cat}`}
                  className="text-muted hover:text-ink transition-colors duration-300 uppercase text-tag tracking-wide-tag"
                >
                  {t(cat, lang)}
                </Link>
              ))}
            </div>
          </div>

          {/* Studio */}
          <div>
            <div className="text-nav uppercase tracking-wide-nav text-ink mb-3">
              {t('studio', lang)}
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { key: 'about', href: '/studio' },
                { key: 'contact', href: '/contact' },
                { key: 'news', href: '/news' },
              ].map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="text-muted hover:text-ink transition-colors duration-300 uppercase text-tag tracking-wide-tag"
                >
                  {t(key, lang)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="divider" />
      <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-ink rounded-sm flex items-center justify-center">
            <span className="text-cream text-xs font-medium">
              ai<span className="text-accent">/</span>
            </span>
          </div>
          <span className="text-body-sm text-muted">
            © 2005–{new Date().getFullYear()}, ai international ltd. all rights reserved
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/privacy-policy"
            className="text-tag uppercase tracking-wide-tag text-muted hover:text-ink transition-colors duration-300"
          >
            {t('privacy_policy', lang)}
          </Link>
          <Link
            href="/cookie-policy"
            className="text-tag uppercase tracking-wide-tag text-muted hover:text-ink transition-colors duration-300"
          >
            {t('cookie_policy', lang)}
          </Link>
          <span className="text-tag uppercase tracking-wide-tag text-muted">
            {t('website_development', lang)}
          </span>
        </div>
      </div>
    </footer>
  )
}
