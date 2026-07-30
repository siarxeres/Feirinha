'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { publicarFeiraAction } from './actions'

export function PublicarButton({ feiraId }: { feiraId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handlePublicar(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    startTransition(async () => {
      const result = await publicarFeiraAction(feiraId)
      if (result?.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handlePublicar}
        disabled={isPending}
        className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-60"
        style={{ backgroundColor: '#E8560A' }}
      >
        {isPending ? 'Publicando...' : 'Publicar'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
