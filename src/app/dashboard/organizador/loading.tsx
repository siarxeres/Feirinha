import { Skeleton } from "@/components/ui/skeleton"

export default function OrganizadorLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-sm flex flex-col">
        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-2xl" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-56" />
        </header>

        <div className="flex-1 px-5 pb-28 space-y-5">
          <section className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 shadow-sm bg-white border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-[18px] w-[18px] rounded-full" />
                </div>
                <Skeleton className="h-9 w-12" />
              </div>
            ))}
          </section>

          <Skeleton className="h-12 w-full rounded-2xl" />

          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
