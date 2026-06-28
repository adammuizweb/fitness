import { I18nServer } from '@/lib/i18n/server'

const techStack = [
  { name: 'Next.js', href: 'https://nextjs.org', color: 'from-stone-900 to-stone-700' },
  { name: 'TypeScript', href: 'https://typescriptlang.org', color: 'from-blue-600 to-blue-500' },
  { name: 'Supabase', href: 'https://supabase.com', color: 'from-emerald-600 to-green-500' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com', color: 'from-cyan-500 to-blue-500' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com', color: 'from-stone-800 to-stone-600' },
  { name: 'TanStack Query', href: 'https://tanstack.com/query', color: 'from-red-600 to-pink-500' },
  { name: 'Recharts', href: 'https://recharts.org', color: 'from-indigo-600 to-purple-500' },
  { name: 'Vercel', href: 'https://vercel.com', color: 'from-stone-900 to-stone-600' },
]

export async function TechStackSection() {
  const { t } = await I18nServer()

  return (
    <section className="py-16 bg-white border-t border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-8">
          {t('landing.stats.title')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <a
              key={tech.name}
              href={tech.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative px-4 py-2.5 rounded-xl border border-stone-200 bg-white
                text-sm font-medium text-stone-600
                hover:border-transparent hover:text-white
                transition-all duration-300 shadow-sm hover:shadow-lg
                animate-tech-glow
                ${tech.color ? `hover:bg-gradient-to-r ${tech.color}` : ''}`}
              style={{ animationDelay: `${Math.random() * 2}s` }}
            >
              <span className="relative z-10">{tech.name}</span>
            </a>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-6">
          Built with modern open-source technologies —{' '}
          <a href="https://github.com/adammuizweb/fitness" target="_blank" rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium underline underline-offset-2">
            view source on GitHub
          </a>
        </p>
      </div>
    </section>
  )
}
