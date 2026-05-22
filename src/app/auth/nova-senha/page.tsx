"use client"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"

function NovaSenhaForm() {
  const [pronto, setPronto] = useState(false)
  const [linkExpirado, setLinkExpirado] = useState(false)
  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // PKCE flow: Supabase envia ?code=XXXX
    const code = searchParams.get("code")
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) setLinkExpirado(true)
          else setPronto(true)
        })
      return
    }

    // Implicit flow: Supabase envia #access_token=...&type=recovery no hash
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token") ?? ""
    const type = params.get("type")

    if (accessToken && type === "recovery") {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) setLinkExpirado(true)
          else setPronto(true)
        })
      return
    }

    // Fallback: sessão já estabelecida ou evento disparado por outro caminho
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPronto(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setPronto(true)
    })
    return () => subscription.unsubscribe()
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
          {linkExpirado ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Link expirado. Solicite um novo link de recuperação.
              </p>
              <Button asChild className="w-full bg-[#E8560A] hover:bg-[#C4450A]">
                <Link href="/auth/recuperar-senha">Solicitar novo link</Link>
              </Button>
            </div>
          ) : !pronto ? (
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
