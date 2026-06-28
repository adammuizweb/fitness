import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-6', className)}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-3 w-48 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-6 flex items-center gap-4', className)}>
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-7 w-12" />
      </div>
    </div>
  )
}
