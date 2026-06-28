import { cookies } from 'next/headers'
import { allTranslations, type Lang } from './translations'

const STORAGE_KEY = 'fitness_lang'

export async function I18nServer() {
  const cookieStore = await cookies()
  const stored = cookieStore.get(STORAGE_KEY)?.value
  const lang: Lang = stored === 'en' || stored === 'id' ? stored : 'id'

  function t(key: string, vars?: Record<string, string | number>) {
    const set = allTranslations[lang]
    const fallback = allTranslations.en
    let text = set[key] || fallback[key] || key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  return { t, lang }
}
