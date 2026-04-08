// ─── Language ────────────────────────────────────────
export type Lang = 'en' | 'ru' | 'ar' | 'zh' | 'es'

export const LANGUAGES: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
]

export const RTL_LANGUAGES: Lang[] = ['ar']

// ─── Projects ────────────────────────────────────────
export type Typology =
  | 'residential'
  | 'office'
  | 'public'
  | 'hospitality'
  | 'mixed-use'
  | 'masterplan'
  | 'interior'

export type Status = 'completed' | 'construction' | 'ongoing' | 'concept'

export interface GalleryImage {
  url: string
  caption_en?: string | null
  caption_ru?: string | null
  caption_ar?: string | null
  caption_zh?: string | null
  caption_es?: string | null
  is_hero?: boolean
}

export interface ProjectSpecs {
  address?: string
  floors?: string
  structure?: string
  total_area?: string
  units?: string
  parking?: string
  completion?: string
  budget?: string
  developer?: string
  programme?: string
  mep?: string
  photos_by?: string
}

export interface Project {
  id: string
  slug: string
  display_order: number | null
  title_en: string
  title_ru: string | null
  title_ar: string | null
  title_zh: string | null
  title_es: string | null
  location_en: string | null
  location_ru: string | null
  location_ar: string | null
  location_zh: string | null
  location_es: string | null
  description_en: string | null
  description_ru: string | null
  description_ar: string | null
  description_zh: string | null
  description_es: string | null
  body_en: string | null
  body_ru: string | null
  body_ar: string | null
  body_zh: string | null
  body_es: string | null
  typology: Typology
  status: Status
  is_featured: boolean
  show_in_journal: boolean
  cover_image: string | null
  gallery: GalleryImage[]
  specs: ProjectSpecs
  design_team: string[] | null
  execution_team: string[] | null
  vimeo_url: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

// ─── Press ───────────────────────────────────────────
export type PressCategory = 'media' | 'interview' | 'awards'

export interface PressItem {
  id: string
  slug: string
  date: string | null
  category: PressCategory
  title_en: string
  title_ru: string | null
  title_ar: string | null
  title_zh: string | null
  title_es: string | null
  description_en: string | null
  description_ru: string | null
  description_ar: string | null
  description_zh: string | null
  description_es: string | null
  body_en: string | null
  body_ru: string | null
  body_ar: string | null
  body_zh: string | null
  body_es: string | null
  publication_name: string | null
  cover_image: string | null
  favicon_url: string | null
  external_link: string | null
  project_id: string | null
  is_featured: boolean
  show_in_journal: boolean
  created_at: string
}

// ─── News ────────────────────────────────────────────
export interface NewsItem {
  id: string
  slug: string
  date: string | null
  title_en: string
  title_ru: string | null
  title_ar: string | null
  title_zh: string | null
  title_es: string | null
  description_en: string | null
  description_ru: string | null
  description_ar: string | null
  description_zh: string | null
  description_es: string | null
  body_en: string | null
  body_ru: string | null
  body_ar: string | null
  body_zh: string | null
  body_es: string | null
  cover_image: string | null
  images: { url: string }[]
  external_link: string | null
  project_id: string | null
  source: string
  show_in_journal: boolean
  created_at: string
}

// ─── Homepage Slides ─────────────────────────────────
export interface HomepageSlide {
  id: string
  project_id: string
  image_url: string | null
  display_order: number
  created_at: string
}

// ─── Site Content ────────────────────────────────────
export interface SiteContent {
  id: string
  page_key: string
  content_en: string | null
  content_ru: string | null
  content_ar: string | null
  content_zh: string | null
  content_es: string | null
  updated_at: string
}

// ─── Journal (combined feed) ─────────────────────────
export interface JournalItem {
  type: 'news' | 'press' | 'works'
  slug: string
  date: string | null
  title: string
  description: string | null
  cover_image: string | null
  label: string
  category?: string
}
