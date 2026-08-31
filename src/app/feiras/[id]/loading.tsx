import { Skeleton } from "@/components/ui/skeleton"

export default function FeiraDetalheLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-12">
      {/* Back button skeleton */}
      <div className="mb-8 space-y-5">
        <Skeleton className="h-5 w-24 rounded-lg" />

        {/* Header card skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-64 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="mt-3 h-9 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Booth map skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="mb-6 h-6 w-40 rounded" />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
