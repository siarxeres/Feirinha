"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).single()
  if (!profile?.roles?.includes("admin")) redirect("/dashboard")
  return supabase
}

type CategoriaData = { nome: string; icone: string; cor: string; ativo: boolean }

export async function criarCategoria(data: CategoriaData): Promise<{ success: true } | { error: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("categorias").insert({
    nome: data.nome.trim(),
    icone: data.icone || null,
    cor: data.cor || null,
    ativo: data.ativo,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function editarCategoria(id: string, data: CategoriaData): Promise<{ success: true } | { error: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("categorias").update({
    nome: data.nome.trim(),
    icone: data.icone || null,
    cor: data.cor || null,
    ativo: data.ativo,
  }).eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function excluirCategoria(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("categorias").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}
