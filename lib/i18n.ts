import { Lang } from './types'

/**
 * Get a localized field from a DB row.
 * Falls back to English if the requested language is empty.
 *
 * Usage: getField(project, 'title', 'ru') → title_ru or title_en
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getField<T extends Record<string, any>>(
  item: T,
  field: string,
  lang: Lang
): string {
  const localized = item[`${field}_${lang}`]
  if (localized) return localized
  return item[`${field}_en`] || ''
}

/**
 * Static UI labels for navigation, buttons, filters, etc.
 */
const UI_LABELS: Record<string, Record<Lang, string>> = {
  works: {
    en: 'Works', ru: 'Проекты', ar: 'أعمال', zh: '作品', es: 'Obras',
  },
  press: {
    en: 'Press', ru: 'Пресса', ar: 'صحافة', zh: '新闻报道', es: 'Prensa',
  },
  studio: {
    en: 'Studio', ru: 'Студия', ar: 'الاستوديو', zh: '工作室', es: 'Estudio',
  },
  contact: {
    en: 'Contact', ru: 'Контакты', ar: 'اتصل بنا', zh: '联系我们', es: 'Contacto',
  },
  news: {
    en: 'News', ru: 'Новости', ar: 'أخبار', zh: '新闻', es: 'Noticias',
  },
  home: {
    en: 'Home', ru: 'Главная', ar: 'الرئيسية', zh: '首页', es: 'Inicio',
  },
  journal: {
    en: 'Journal', ru: 'Журнал', ar: 'مجلة', zh: '日志', es: 'Diario',
  },
  explore_portfolio: {
    en: 'Explore Portfolio', ru: 'Смотреть портфолио', ar: 'استكشف المحفظة', zh: '浏览作品集', es: 'Explorar portafolio',
  },
  get_in_touch: {
    en: 'Get in Touch', ru: 'Связаться', ar: 'تواصل معنا', zh: '联系我们', es: 'Contáctenos',
  },
  read_more: {
    en: 'Read More', ru: 'Подробнее', ar: 'اقرأ المزيد', zh: '阅读更多', es: 'Leer más',
  },
  project: {
    en: 'Project', ru: 'Проект', ar: 'مشروع', zh: '项目', es: 'Proyecto',
  },
  previous: {
    en: 'Previous', ru: 'Предыдущий', ar: 'السابق', zh: '上一个', es: 'Anterior',
  },
  next: {
    en: 'Next', ru: 'Следующий', ar: 'التالي', zh: '下一个', es: 'Siguiente',
  },
  all: {
    en: 'All', ru: 'Все', ar: 'الكل', zh: '全部', es: 'Todos',
  },
  featured: {
    en: 'Featured', ru: 'Избранное', ar: 'مميز', zh: '精选', es: 'Destacados',
  },
  search: {
    en: 'Search', ru: 'Поиск', ar: 'بحث', zh: '搜索', es: 'Buscar',
  },
  about: {
    en: 'About', ru: 'О нас', ar: 'حول', zh: '关于', es: 'Acerca de',
  },
  founder: {
    en: 'Founder', ru: 'Основатель', ar: 'المؤسس', zh: '创始人', es: 'Fundador',
  },
  adu_media: {
    en: 'a/d/u media', ru: 'a/d/u медиа', ar: 'a/d/u ميديا', zh: 'a/d/u 媒体', es: 'a/d/u media',
  },
  studio_news: {
    en: 'Studio News', ru: 'Новости студии', ar: 'أخبار الاستوديو', zh: '工作室新闻', es: 'Noticias del estudio',
  },
  project_info: {
    en: 'Project Info', ru: 'Информация о проекте', ar: 'معلومات المشروع', zh: '项目信息', es: 'Información del proyecto',
  },
  privacy_policy: {
    en: 'Privacy Policy', ru: 'Политика конфиденциальности', ar: 'سياسة الخصوصية', zh: '隐私政策', es: 'Política de privacidad',
  },
  cookie_policy: {
    en: 'Cookie Policy', ru: 'Политика cookie', ar: 'سياسة ملفات تعريف الارتباط', zh: 'Cookie政策', es: 'Política de cookies',
  },
  website_development: {
    en: 'Website Development', ru: 'Разработка сайта', ar: 'تطوير الموقع', zh: '网站开发', es: 'Desarrollo web',
  },
  typology: {
    en: 'Typology', ru: 'Типология', ar: 'التصنيف', zh: '类型', es: 'Tipología',
  },
  status_label: {
    en: 'Status', ru: 'Статус', ar: 'الحالة', zh: '状态', es: 'Estado',
  },
  residential: {
    en: 'Residential', ru: 'Жилое', ar: 'سكني', zh: '住宅', es: 'Residencial',
  },
  office: {
    en: 'Office', ru: 'Офис', ar: 'مكتب', zh: '办公', es: 'Oficina',
  },
  public: {
    en: 'Public', ru: 'Общественное', ar: 'عام', zh: '公共', es: 'Público',
  },
  hospitality: {
    en: 'Hospitality', ru: 'Гостиничное', ar: 'ضيافة', zh: '酒店', es: 'Hospitalidad',
  },
  'mixed-use': {
    en: 'Mixed-use', ru: 'Многофункциональное', ar: 'متعدد الاستخدام', zh: '综合体', es: 'Uso mixto',
  },
  masterplan: {
    en: 'Masterplan', ru: 'Мастерплан', ar: 'مخطط رئيسي', zh: '总体规划', es: 'Plan maestro',
  },
  interior: {
    en: 'Interior', ru: 'Интерьер', ar: 'تصميم داخلي', zh: '室内', es: 'Interior',
  },
  completed: {
    en: 'Completed', ru: 'Завершён', ar: 'مكتمل', zh: '已完成', es: 'Completado',
  },
  construction: {
    en: 'Construction', ru: 'Строительство', ar: 'قيد الإنشاء', zh: '建设中', es: 'Construcción',
  },
  ongoing: {
    en: 'Ongoing', ru: 'В процессе', ar: 'قيد التنفيذ', zh: '进行中', es: 'En curso',
  },
  concept: {
    en: 'Concept', ru: 'Концепция', ar: 'مفهوم', zh: '概念', es: 'Concepto',
  },
  media: {
    en: 'Media', ru: 'СМИ', ar: 'وسائل الإعلام', zh: '媒体', es: 'Medios',
  },
  interviews: {
    en: 'Interviews', ru: 'Интервью', ar: 'مقابلات', zh: '访谈', es: 'Entrevistas',
  },
  interview: {
    en: 'Interview', ru: 'Интервью', ar: 'مقابلة', zh: '访谈', es: 'Entrevista',
  },
  awards: {
    en: 'Awards', ru: 'Награды', ar: 'جوائز', zh: '奖项', es: 'Premios',
  },
  selected_projects: {
    en: 'Selected projects', ru: 'Избранные проекты', ar: 'مشاريع مختارة', zh: '精选项目', es: 'Proyectos seleccionados',
  },
  address_and_phone: {
    en: 'Address and Phone', ru: 'Адрес и телефон', ar: 'العنوان والهاتف', zh: '地址与电话', es: 'Dirección y teléfono',
  },
}

/**
 * Get a UI label by key and language.
 * Falls back to English, then to the key itself.
 */
export function t(key: string, lang: Lang): string {
  const entry = UI_LABELS[key]
  if (!entry) return key
  return entry[lang] || entry.en || key
}

/**
 * Check if a language is RTL.
 */
export function isRTL(lang: Lang): boolean {
  return lang === 'ar'
}
