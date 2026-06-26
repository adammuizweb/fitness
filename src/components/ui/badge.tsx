import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  admin: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  banned: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
}

interface BadgeProps {
  variant?: keyof typeof badgeVariants
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
