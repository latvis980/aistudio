import Link from 'next/link'
import Image from 'next/image'
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
        {/* Desktop left column — email + socials */}
        <div className="hidden lg:flex flex-col gap-3 lg:min-w-[260px]">
          <a
            href="mailto:office@aistudio.co.uk"
            className="text-accent hover:text-accent/80 transition-colors duration-300 text-body"
          >
            office@aistudio.co.uk
          </a>
          <div className="flex flex-col gap-1">
            <BracketLink href="https://linkedin.com/" external>
              LinkedIn
            </BracketLink>
            <BracketLink href="https://t.me/a_d_u_media" external>
              a/d/u
            </BracketLink>
          </div>
        </div>

        {/* Mobile contacts — single line */}
        <div className="flex lg:hidden items-center gap-2 text-body-sm">
          <a
            href="mailto:office@aistudio.co.uk"
            className="text-accent hover:text-accent/80 transition-colors duration-300"
          >
            office@aistudio.co.uk
          </a>
          <span className="text-muted">|</span>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink transition-colors duration-300"
          >
            linkedin
          </a>
          <span className="text-muted">|</span>
          <a
            href="https://t.me/a_d_u_media"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink transition-colors duration-300"
          >
            a/d/u
          </a>
        </div>

        {/* Right columns — sitemap */}
        <div className="grid grid-cols-3 gap-x-8 lg:gap-x-16 gap-y-8 text-body-sm">
          {/* Works */}
          <div>
            <Link href="/works" className="text-nav uppercase tracking-wide-nav text-ink mb-3 block hover:text-accent transition-colors duration-300">
              {t('works', lang)}
            </Link>
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
            <Link href="/press" className="text-nav uppercase tracking-wide-nav text-ink mb-3 block hover:text-accent transition-colors duration-300">
              {t('press', lang)}
            </Link>
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
            <Link href="/studio" className="text-nav uppercase tracking-wide-nav text-ink mb-3 block hover:text-accent transition-colors duration-300">
              {t('studio', lang)}
            </Link>
            <div className="flex flex-col gap-1.5">
              {[
                { key: 'about', href: '/studio#about' },
                { key: 'news', href: '/news' },
                { key: 'get_in_touch', href: '/studio#get-in-touch' },
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
          <Image
            src="/images/logo-footer.png"
            alt="AI Studio"
            width={540}
            height={540}
            className="w-9 h-9 rounded-sm"
          />
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
