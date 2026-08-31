import Link from "next/link"
import type { LucideIcon } from "lucide-react"

type EmptyStateAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never }

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  /** Envolve em card branco com borda — use em telas onde o vazio é o conteúdo principal da página. */
  card?: boolean
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, card = false, className = "" }: EmptyStateProps) {
  const conteudo = (
    <div className={`flex flex-col items-center text-center gap-3 py-8 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
        <Icon size={24} className="text-orange-500" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-1 max-w-[30ch] mx-auto">{description}</p>}
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] bg-primary hover:bg-primary/80"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] bg-primary hover:bg-primary/80"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )

  if (!card) return conteudo

  return (
    <div className="rounded-2xl bg-white shadow-sm border-2 border-border">
      {conteudo}
    </div>
  )
}
