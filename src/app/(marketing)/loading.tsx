import { Skeleton } from '@/components/ui/Skeleton'

export default function MarketingLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto mb-3" />
          <Skeleton className="h-5 w-72 mx-auto mb-8" />
          <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-56 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
