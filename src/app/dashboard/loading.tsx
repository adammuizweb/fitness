import { Skeleton, SkeletonStatCard } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg">
              <div>
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  )
}
