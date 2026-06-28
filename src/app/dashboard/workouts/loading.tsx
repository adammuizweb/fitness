import { Skeleton } from '@/components/ui/Skeleton'

export default function WorkoutsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-48 mb-4" />
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <div className="flex gap-1.5 mb-4">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-14 rounded-full" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48 mb-3" />
                <div className="flex gap-1 mb-2">
                  {[...Array(7)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-7 rounded" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 ml-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
