"use client"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"

function NovaSenhaForm() {
  const [pronto, setPronto] = useState(false)
  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash")
    const type = searchParams.get("type")

    if (tokenHash) {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: (type ?? "recovery") as "recovery" })
        .then(({ error }) => {
          if (error) router.replace("/auth/recuperar-senha")
          else setPronto(true)
        })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPronto(true)
      else router.replace("/auth/recuperar-senha")
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (senha !== confirmar) {
      toast.error("As senhas não coincidem.")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) {
      toast.error("Erro ao atualizar senha. Tente novamente.")
      setLoading(false)
      return
    }
    toast.success("Senha atualizada com sucesso!")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/feirinha-logo.svg" alt="Feirinha" width={52} height={52} className="mx-auto mb-2" />
          <CardTitle className="text-2xl">Nova senha</CardTitle>
          <CardDescription>Defina sua nova senha de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          {!pronto ? (
            <p className="text-center text-sm text-muted-foreground">Validando link de recuperação...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="senha">Nova senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmar">Confirmar senha</Label>
                <Input
                  id="confirmar"
                  type="password"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#E8560A] hover:bg-[#C4450A]" disabled={loading}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function NovaSenhaPage() {
  return (
    <Suspense>
      <NovaSenhaForm />
    </Suspense>
  )
}
