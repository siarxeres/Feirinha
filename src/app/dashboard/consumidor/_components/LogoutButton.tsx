"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
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
