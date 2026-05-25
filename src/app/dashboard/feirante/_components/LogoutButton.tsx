"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

interface Props {
  variant?: "icon" | "full"
}

export function LogoutButton({ variant = "icon" }: Props) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.replace("/auth/login")
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-red-50 active:bg-red-100"
      >
        <LogOut size={18} className="text-red-500 shrink-0" />
        <span className="text-sm font-medium text-red-500">Sair da conta</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Sair"
      className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      <LogOut size={21} className="text-gray-700" />
    </button>
  )
}
