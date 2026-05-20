// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// ROTA TEMPORÁRIA — apagar após uso
// Gera barracas para uma feira via browser autenticado
// Uso: GET /api/admin/seed-barracas?feira_id=<uuid>&linhas=5&colunas=5

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado. Faça login primeiro." }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const feiraId = searchParams.get("feira_id") ?? "55657dd0-39aa-41dd-af66-3f8ad39273c2"
  const linhas  = parseInt(searchParams.get("linhas")  ?? "5", 10)
  const colunas = parseInt(searchParams.get("colunas") ?? "5", 10)

  // Verifica se a feira existe e pertence ao usuário
  const { data: feira, error: feiraError } = await supabase
    .from("feiras")
    .select("id, nome, organizador_id")
    .eq("id", feiraId)
    .single() as unknown as {
      data: { id: string; nome: string; organizador_id: string } | null
      error: { message: string } | null
    }

  if (feiraError || !feira) {
    return NextResponse.json({ error: "Feira não encontrada.", detail: feiraError?.message }, { status: 404 })
  }

  if (feira.organizador_id !== user.id) {
    return NextResponse.json({ error: "Você não é o organizador desta feira." }, { status: 403 })
  }

  // Verifica se já existem barracas
  const { count } = await supabase
    .from("barracas")
    .select("id", { count: "exact", head: true })
    .eq("feira_id", feiraId)

  if (count && count > 0) {
    return NextResponse.json({
      info: `Feira "${feira.nome}" já tem ${count} barraca(s). Nenhuma ação realizada.`,
    })
  }

  // 1ª tentativa: RPC gerar_barracas
  const { error: rpcError } = await supabase.rpc("gerar_barracas", {
    p_feira_id: feiraId,
    p_linhas:   linhas,
    p_colunas:  colunas,
  })

  if (!rpcError) {
    return NextResponse.json({
      success: true,
      method: "rpc:gerar_barracas",
      feira: feira.nome,
      total: linhas * colunas,
      grid: `${linhas}×${colunas}`,
    })
  }

  // 2ª tentativa: insert direto se RPC falhar
  const rows = []
  let numero = 1
  for (let linha = 1; linha <= linhas; linha++) {
    for (let coluna = 1; coluna <= colunas; coluna++) {
      rows.push({
        feira_id: feiraId,
        codigo: `B${numero}`,
        linha,
        coluna,
        status: "livre",
      })
      numero++
    }
  }

  const { error: insertError } = await supabase.from("barracas").insert(rows)

  if (insertError) {
    return NextResponse.json({
      error: "Falha no insert direto.",
      rpc_error: rpcError.message,
      insert_error: insertError.message,
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    method: "insert_direto",
    feira: feira.nome,
    total: rows.length,
    grid: `${linhas}×${colunas}`,
    aviso: `RPC falhou (${rpcError.message}), insert direto funcionou.`,
  })
}
