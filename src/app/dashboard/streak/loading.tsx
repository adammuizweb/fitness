import { Skeleton } from '@/components/ui/Skeleton'

export default function StreakLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="flex flex-wrap gap-1">
          {[...Array(50)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
