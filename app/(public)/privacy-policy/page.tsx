import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getLangFromCookies } from '@/lib/utils'
import { getField, t } from '@/lib/i18n'
import Breadcrumb from '@/components/layout/Breadcrumb'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default async function PrivacyPolicyPage() {
  const cookieStore = cookies()
  const lang = getLangFromCookies(cookieStore)
  const supabase = createServerClient()

  const { data } = await supabase
    .from('site_content').select('*').eq('page_key', 'privacy_policy').single()

  const content = data ? getField(data, 'content', lang) : null

  return (
    <>
      <Breadcrumb crumbs={[{ label: t('privacy_policy', lang) }]} lang={lang} />
      <h1 className="page-title mb-8">{t('privacy_policy', lang)}</h1>
      <div className="max-w-[700px] text-body text-ink/90 whitespace-pre-line">
        {content || 'Privacy policy content will be added soon.'}
      </div>
    </>
  )
}
