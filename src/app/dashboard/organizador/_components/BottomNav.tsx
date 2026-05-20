'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Plus, Store, User } from 'lucide-react'

const items = [
  { icon: LayoutGrid, label: 'Painel',     href: '/dashboard/organizador' },
  { icon: Plus,        label: 'Nova Feira', href: '/feiras/nova' },
  { icon: Store,       label: 'Feiras',     href: '/dashboard/organizador/feiras' },
  { icon: User,        label: 'Perfil',     href: '/dashboard/organizador/perfil' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex">
        {items.map(({ icon: Icon, label, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors"
              style={{ color: active ? '#E8560A' : '#9CA3AF' }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
