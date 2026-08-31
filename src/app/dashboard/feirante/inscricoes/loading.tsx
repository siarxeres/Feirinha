import { Skeleton } from "@/components/ui/skeleton"

export default function InscricoesFeiranteLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
        <header className="px-5 pt-12 pb-5">
          <div className="flex items-center gap-2 mb-5">
            <Skeleton className="h-9 w-9 rounded-2xl" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-9 w-52" />
        </header>

        <div className="flex-1 px-5 pb-28 space-y-3">
          <div className="flex gap-2 pb-1">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
