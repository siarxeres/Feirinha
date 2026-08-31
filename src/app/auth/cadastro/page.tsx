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

export default function CadastroPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [papel, setPapel] = useState("consumidor")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCadastro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
          roles: [papel],
        },
      },
    })

    if (error) {
      toast.error("Falha ao cadastrar. Verifique os dados e tente novamente.")
      setLoading(false)
      return
    }

    const msg = papel === "feirante"
      ? "Conta criada! Faça login para completar seu cadastro."
      : "Cadastro realizado com sucesso! Faça login para continuar."
    toast.success(msg)
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/feirinha-logo.svg" alt="Feirinha" width={52} height={52} className="mx-auto mb-2" />
          <CardTitle className="text-2xl">Feirinha</CardTitle>
          <CardDescription>Crie sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCadastro} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="papel">Papel</Label>
              <select
                id="papel"
                value={papel}
                onChange={e => setPapel(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-success"
              >
                <option value="organizador">Organizador</option>
                <option value="feirante">Feirante</option>
                <option value="consumidor">Consumidor</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/80" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/auth/login" className="text-success font-medium hover:underline">Entrar</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
