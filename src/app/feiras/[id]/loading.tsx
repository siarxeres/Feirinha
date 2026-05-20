export default function FeiraDetalheLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-12">
      {/* Back button skeleton */}
      <div className="mb-8 space-y-5">
        <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200" />

        {/* Header card skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-64 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-9 w-12 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Booth map skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-slate-100"
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
