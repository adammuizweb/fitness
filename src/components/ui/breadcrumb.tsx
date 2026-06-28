'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
