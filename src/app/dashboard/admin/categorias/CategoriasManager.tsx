"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, Utensils, Palette, Gem, Music, Leaf, Flower2, Wrench, Shirt, type LucideProps } from "lucide-react"
import type { ComponentType } from "react"

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Utensils,
  Palette,
  Gem,
  Music,
  Leaf,
  Flower2,
  Wrench,
  Shirt,
}

function CategoriaIcon({ nome, cor }: { nome: string; cor?: string | null }) {
  const Icon = ICON_MAP[nome]
  if (Icon) return <Icon size={20} color={cor ?? "#6b7280"} />
  return <span>{nome}</span>
}
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { criarCategoria, editarCategoria, excluirCategoria } from "./actions"

type Categoria = {
  id: string
  nome: string
  icone: string | null
  cor: string | null
  ativo: boolean
}

const EMPTY = { nome: "", icone: "", cor: "#E8560A", ativo: true }

export function CategoriasManager() {
  const supabase = createClient()
  const [lista, setLista] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [deletandoId, setDeletandoId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from("categorias")
      .select("id, nome, icone, cor, ativo")
      .order("nome", { ascending: true })
    setLista((data ?? []) as Categoria[])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setEditando(null)
    setForm(EMPTY)
    setError(null)
    setModalOpen(true)
  }

  function abrirEditar(cat: Categoria) {
    setEditando(cat)
    setForm({ nome: cat.nome, icone: cat.icone ?? "", cor: cat.cor ?? "#E8560A", ativo: cat.ativo })
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
    const payload = { nome: form.nome.trim(), icone: form.icone, cor: form.cor, ativo: form.ativo }
    const result = editando
      ? await editarCategoria(editando.id, payload)
      : await criarCategoria(payload)
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
    await excluirCategoria(deletandoId)
    setConfirmOpen(false)
    setDeletandoId(null)
    carregar()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#E8560A" }}
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>
      <p className="text-gray-500 mb-8">Categorias disponíveis para classificar feiras e produtos</p>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center border border-gray-200">
          <p className="text-gray-400 text-sm">Nenhuma categoria cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {cat.icone && (
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: cat.cor ? `${cat.cor}22` : "#f3f4f6", color: cat.cor ?? "#6b7280" }}
                  >
                    <CategoriaIcon nome={cat.icone} cor={cat.cor} />
                  </span>
                )}
                <span className="font-semibold text-gray-900 leading-tight">{cat.nome}</span>
              </div>

              <div className="flex items-center gap-2">
                {cat.cor && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-gray-200"
                      style={{ backgroundColor: cat.cor }}
                    />
                    {cat.cor}
                  </span>
                )}
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${cat.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {cat.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <button
                  onClick={() => abrirEditar(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  onClick={() => pedirExclusao(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal criar / editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Ex: Alimentação"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ícone (emoji)</label>
              <input
                type="text"
                value={form.icone}
                onChange={e => setForm(f => ({ ...f, icone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Ex: 🍔"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.cor}
                  onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <span className="text-sm text-gray-600">{form.cor}</span>
              </div>
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
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors hover:opacity-90"
              style={{ backgroundColor: "#E8560A" }}
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
            Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
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
