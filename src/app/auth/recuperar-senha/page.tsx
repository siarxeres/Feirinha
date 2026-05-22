"use client"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [etapa, setEtapa] = useState<"email" | "codigo">("email")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEnviarCodigo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    setLoading(false)
    if (error) {
      toast.error("Não foi possível enviar o código. Verifique o e-mail informado.")
      return
    }
    setEtapa("codigo")
  }

  const handleVerificarCodigo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: "recovery",
    })
    setLoading(false)
    if (error) {
      toast.error("Código inválido ou expirado. Tente novamente.")
      return
    }
    router.push("/auth/nova-senha")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/feirinha-logo.svg" alt="Feirinha" width={52} height={52} className="mx-auto mb-2" />
          <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          <CardDescription>
            {etapa === "email"
              ? "Informe seu e-mail para receber o código"
              : `Código enviado para ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {etapa === "email" ? (
            <form onSubmit={handleEnviarCodigo} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#E8560A] hover:bg-[#C4450A]" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
              <p className="text-center text-sm">
                <Link href="/auth/login" className="text-[#1D9E75] hover:underline">Voltar ao login</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerificarCodigo} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="codigo">Código de 6 dígitos</Label>
                <Input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#E8560A] hover:bg-[#C4450A]" disabled={loading || codigo.length < 6}>
                {loading ? "Verificando..." : "Verificar"}
              </Button>
              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setEtapa("email")}
                  className="text-[#1D9E75] hover:underline text-sm"
                >
                  Usar outro e-mail
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
