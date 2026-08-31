"use client"

import { useState, useTransition } from "react"
import { Pencil, Check, X } from "lucide-react"
import { atualizarPerfil } from "./actions"
import { useRouter } from "next/navigation"

interface Props {
  nome: string
}

export function EditProfileForm({ nome: initialNome }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialNome)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await atualizarPerfil(value)
      if ("error" in result) {
        setError(result.error)
        return
      }
      setEditing(false)
      router.refresh()
    })
  }

  const handleCancel = () => {
    setValue(initialNome)
    setError(null)
    setEditing(false)
  }

  return (
    <div>
      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nome</label>
      {editing ? (
        <div className="mt-1.5 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
            className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${error ? "border-red-500" : "border-border"}`}
            disabled={isPending}
          />
          <button
            onClick={handleSave}
            disabled={isPending}
            className="p-2 rounded-xl text-white transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 bg-primary"
            aria-label="Salvar"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            aria-label="Cancelar"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-base font-medium text-gray-900">{value || "—"}</p>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-orange-50 transition-all active:scale-95"
            aria-label="Editar nome"
          >
            <Pencil size={15} />
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
