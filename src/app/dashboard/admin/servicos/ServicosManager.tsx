"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, Zap, Droplets, Tent, UtensilsCrossed, Armchair, Snowflake, Flame, Wrench } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { criarServico, editarServico, excluirServico } from "./actions"

type Servico = {
  id: string
  nome: string
  descricao: string | null
  categoria: string | null
  ativo: boolean
}

const CATEGORIAS_OPCOES = [
  { value: "eletricista",  label: "Eletricista" },
  { value: "encanador",   label: "Encanador" },
  { value: "instalador",  label: "Instalador de Barracas" },
  { value: "mobilia",     label: "Mobília (Mesas/Cadeiras)" },
  { value: "energia",     label: "Energia" },
  { value: "alimentos",   label: "Alimentos (Gelo/Carvão)" },
  { value: "estrutura",   label: "Estrutura" },
  { value: "outros",      label: "Outros" },
]

const ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  eletricista: { icon: Zap,             color: "bg-yellow-50 text-yellow-500" },
  encanador:   { icon: Droplets,        color: "bg-blue-50 text-blue-500" },
  instalador:  { icon: Tent,            color: "bg-orange-50 text-orange-500" },
  mobilia:     { icon: UtensilsCrossed, color: "bg-green-50 text-green-500" },
  energia:     { icon: Zap,             color: "bg-yellow-50 text-yellow-500" },
  alimentos:   { icon: Snowflake,       color: "bg-cyan-50 text-cyan-500" },
  estrutura:   { icon: Armchair,        color: "bg-purple-50 text-purple-500" },
  outros:      { icon: Flame,           color: "bg-red-50 text-red-500" },
}

const EMPTY = { nome: "", descricao: "", categoria: "outros", ativo: true }

export function ServicosManager() {
  const supabase = createClient()
  const [lista, setLista] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editando, setEditando] = useState<Servico | null>(null)
  const [deletandoId, setDeletandoId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from("servicos")
      .select("id, nome, descricao, categoria, ativo")
      .is("feira_id", null)
      .order("nome", { ascending: true })
    setLista((data ?? []) as Servico[])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setEditando(null)
    setForm(EMPTY)
    setError(null)
    setModalOpen(true)
  }

  function abrirEditar(s: Servico) {
    setEditando(s)
    setForm({
      nome: s.nome,
      descricao: s.descricao ?? "",
      categoria: s.categoria ?? "outros",
      ativo: s.ativo,
    })
    setError(null)
    setModalOpen(true)
  }

  function pedirExclusao(id: string) {
    setDeletandoId(id)
    setConfirmOpen(true)
  }

  async function salvar() {
    if (!form.nome.trim()) return
    setSaving(true)
    setError(null)
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao || null,
      categoria: form.categoria,
      ativo: form.ativo,
    }
    const result = editando
      ? await editarServico(editando.id, payload)
      : await criarServico(payload)
    setSaving(false)
    if ("error" in result) {
      setError(result.error)
    } else {
      setModalOpen(false)
      carregar()
    }
  }

  async function confirmarExclusao() {
    if (!deletandoId) return
    await excluirServico(deletandoId)
    setConfirmOpen(false)
    setDeletandoId(null)
    carregar()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Serviços de Suporte</h1>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 bg-primary"
        >
          <Plus size={16} />
          Novo Serviço
        </button>
      </div>
      <p className="text-gray-500 mb-8">Prestadores de serviço para infraestrutura das feiras</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nenhum serviço cadastrado"
          description="Cadastre os prestadores de serviço disponíveis pra infraestrutura das feiras."
          action={{ label: "Novo serviço", onClick: abrirNovo }}
          card
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((s) => {
            const cat = s.categoria ?? "outros"
            const { icon: Icon, color } = ICON_MAP[cat] ?? ICON_MAP["outros"]
            const catLabel = CATEGORIAS_OPCOES.find(o => o.value === cat)?.label ?? cat
            return (
              <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 leading-tight truncate">{s.nome}</p>
                    <p className="text-xs text-gray-400 truncate">{catLabel}</p>
                  </div>
                </div>

                {s.descricao && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.descricao}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => abrirEditar(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => pedirExclusao(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal criar / editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Ex: João Eletricista"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
              >
                {CATEGORIAS_OPCOES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                placeholder="Descreva o serviço oferecido..."
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">Ativo</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.ativo ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.ativo ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={saving || !form.nome.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground disabled:opacity-50 transition-colors hover:opacity-90 bg-primary"
            >
              {saving ? "Salvando..." : editando ? "Salvar" : "Criar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmação exclusão */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarExclusao}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
