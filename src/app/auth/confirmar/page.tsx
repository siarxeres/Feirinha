"use client"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

function ConfirmarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/auth/nova-senha"

    if (!code) {
      router.replace("/auth/recuperar-senha?error=expired")
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) router.replace("/auth/recuperar-senha?error=expired")
      else router.replace(next)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/feirinha-logo.svg" alt="Feirinha" width={52} height={52} className="mx-auto mb-2" />
          <CardTitle className="text-2xl">Validando...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">Aguarde enquanto validamos seu link.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmarPage() {
  return (
    <Suspense>
      <ConfirmarForm />
    </Suspense>
  )
}
