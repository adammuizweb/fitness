import { I18nServer } from '@/lib/i18n/server'

const svgLogos: Record<string, string> = {
  'Next.js': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l5.564 7.546 1.5 2.028V7.2h-1.6v9.092l.386-.003 4.789-6.706H19.06l-3.276 4.587 2.881 6.808z" fill="currentColor"/></svg>`,
  'TypeScript': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" opacity="0.9"/><path d="M6.5 11.5h3v9h2v-9h3V9.5h-8v2zM14.5 10v2.5c0 .5.3 1 .8 1.2l1.2.6c.6.3 1 .7 1 1.2v1.5c0 .8-.7 1.5-1.5 1.5h-2.5c-.8 0-1.5-.7-1.5-1.5" stroke="#fff" stroke-width="1.2" fill="none"/></svg>`,
  'Supabase': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M13.5 1.5L4.5 14h7l-1 8.5 9-12.5h-7l1-8.5z" fill="currentColor"/></svg>`,
  'Tailwind CSS': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M12 4C8.5 4 6.2 6 5.1 10c1.1-2 2.4-2.8 3.9-2.4.9.2 1.5.8 2.2 1.5 1.1 1.1 2.4 2.4 5.2 2.4 3.5 0 5.8-2 6.9-6-1.1 2-2.4 2.8-3.9 2.4-.9-.2-1.5-.8-2.2-1.5C15.1 5.4 13.8 4 12 4zm-6.9 8c-3.5 0-5.8 2-6.9 6 1.1-2 2.4-2.8 3.9-2.4.9.2 1.5.8 2.2 1.5 1.1 1.1 2.4 2.4 5.2 2.4 3.5 0 5.8-2 6.9-6-1.1 2-2.4 2.8-3.9 2.4-.9-.2-1.5-.8-2.2-1.5-1.1-1.1-2.4-2.4-5.2-2.4z" fill="currentColor"/></svg>`,
  'shadcn/ui': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/><circle cx="18" cy="6" r="1.5" fill="currentColor"/><circle cx="6" cy="18" r="1.5" fill="currentColor"/><circle cx="18" cy="18" r="1.5" fill="currentColor"/></svg>`,
  'TanStack Query': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M12 2a2 2 0 012 2v3a2 2 0 01-4 0V4a2 2 0 012-2z" fill="currentColor"/><path d="M12 12a2 2 0 012 2v3a2 2 0 01-4 0v-3a2 2 0 012-2z" fill="currentColor" opacity="0.6"/><path d="M12 22a2 2 0 01-2-2v-3a2 2 0 014 0v3a2 2 0 01-2 2z" fill="currentColor" opacity="0.3"/></svg>`,
  'Recharts': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M3 20h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 16l3-5 4 2 5-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="16" r="1.5" fill="currentColor"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="13" cy="13" r="1.5" fill="currentColor"/><circle cx="18" cy="6" r="1.5" fill="currentColor"/></svg>`,
  'Vercel': `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><polygon points="12 2 22 22 2 22" fill="currentColor"/></svg>`,
}

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
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white
                text-sm font-medium text-stone-600
                hover:border-transparent hover:text-white
                transition-all duration-300 shadow-sm hover:shadow-lg
                animate-tech-glow
                ${tech.color ? `hover:bg-gradient-to-r ${tech.color}` : ''}`}
              style={{ animationDelay: `${Math.random() * 2}s` }}
            >
              <span
                className="w-5 h-5 text-stone-400 group-hover:text-white/80 transition-colors duration-300"
                dangerouslySetInnerHTML={{ __html: svgLogos[tech.name] || '' }}
              />
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
