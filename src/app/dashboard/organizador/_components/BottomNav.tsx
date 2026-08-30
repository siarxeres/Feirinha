'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, ClipboardList, Plus, type LucideIcon } from 'lucide-react'

const itemsEsquerda: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: LayoutGrid, label: 'Painel', href: '/dashboard/organizador' },
]

const itemsDireita: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: ClipboardList, label: 'Inscrições', href: '/dashboard/organizador/inscricoes' },
]

export function BottomNav() {
  const pathname = usePathname()

  function renderItem({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
    const active = pathname === href
    return (
      <Link
        key={href}
        href={href}
        className="flex-1 flex flex-col items-center py-3 text-xs font-medium text-gray-500"
      >
        <span
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all duration-200 ${
            active ? 'bg-primary/10 text-primary' : ''
          }`}
        >
          <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
          <span>{label}</span>
        </span>
      </Link>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex">
        {itemsEsquerda.map(renderItem)}

        <Link
          href="/feiras/nova"
          aria-label="Criar feira"
          className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-transform active:scale-95"
          style={{ color: '#E8560A' }}
        >
          <span
            className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white -mt-6"
            style={{ backgroundColor: '#E8560A' }}
          >
            <Plus size={24} strokeWidth={2.5} />
          </span>
          Criar
        </Link>

        {itemsDireita.map(renderItem)}
      </div>
    </nav>
  )
}
