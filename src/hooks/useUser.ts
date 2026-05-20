"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function useUser() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
    setProfile(data)
  }

  const refetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchProfile(user.id)
      setLoading(false)
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    loading,
    isOrganizador: profile?.roles?.includes("organizador") ?? false,
    isFeirante: profile?.roles?.includes("feirante") ?? false,
    refetch,
  }
}
