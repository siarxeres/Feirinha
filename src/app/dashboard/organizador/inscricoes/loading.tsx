import { Skeleton } from "@/components/ui/skeleton"

export default function InscricoesOrganizadorLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
        <header className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
        </header>

        <div className="flex-1 px-5 pb-28 pt-2 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
