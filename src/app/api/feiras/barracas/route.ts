import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 })
  }

  const body = await request.json()
  const { feira_id, linhas, colunas } = body

  if (!feira_id || !linhas || !colunas) {
    return new Response(JSON.stringify({ error: "Dados incompletos" }), { status: 400 })
  }

  const barracas = []
  let numero = 1
  for (let linha = 1; linha <= linhas; linha++) {
    for (let coluna = 1; coluna <= colunas; coluna++) {
      barracas.push({
        feira_id,
        codigo: `B${numero}`,
        linha,
        coluna,
        status: "livre",
      })
      numero++
    }
  }

  const { error } = await supabase
    .from("barracas")
    .insert(barracas)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, total: barracas.length }), { status: 201 })
}
