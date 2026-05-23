"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Map, User } from "lucide-react"

const items = [
  { icon: Compass, label: "Explorar", href: "/dashboard/consumidor" },
  { icon: Map,     label: "Mapa",     href: "/dashboard/consumidor/mapa" },
  { icon: User,    label: "Perfil",   href: "/dashboard/consumidor/perfil" },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        {items.map(({ icon: Icon, label, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors"
              style={{ color: active ? "#E8560A" : "#6B7280" }}
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