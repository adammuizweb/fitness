import { I18nServer } from '@/lib/i18n/server'
import { Dumbbell } from 'lucide-react'

export default async function AboutPage() {
  const { t } = await I18nServer()

  const stack = [
    { name: 'Next.js', desc: 'React framework with SSR' },
    { name: 'TypeScript', desc: 'Type-safe JavaScript' },
    { name: 'Supabase', desc: 'PostgreSQL + Auth + RLS' },
    { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
    { name: 'shadcn/ui', desc: 'Reusable UI components' },
    { name: 'TanStack Query', desc: 'Server state management' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{t('about.title')}</h1>
        </div>
      </div>

      <div className="prose prose-stone max-w-none">
        <p className="text-lg text-stone-600 leading-relaxed mb-6">
          {t('about.desc1')}
        </p>
        <p className="text-lg text-stone-600 leading-relaxed mb-10">
          {t('about.desc2')}
        </p>

        <h2 className="text-xl font-semibold text-stone-900 mb-4">{t('about.stack')}</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {stack.map((s) => (
            <div key={s.name} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="font-medium text-stone-900">{s.name}</div>
              <div className="text-sm text-stone-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-stone-600">
            {t('about.owner')}{' '}
            <a
              href="https://github.com/adammuizweb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              @adammuizweb
            </a>
            .&nbsp;
            <a
              href="https://github.com/adammuizweb/fitness"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              {t('footer.source')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
