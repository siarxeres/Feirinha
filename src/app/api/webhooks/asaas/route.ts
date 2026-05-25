import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  // Asaas envia o token no header "asaas-access-token"
  const token = req.headers.get("asaas-access-token")
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { event: string; payment?: any }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { event, payment } = body
  if (!payment?.id) return Response.json({ received: true })

  const db = adminDb()
  const feiranteId: string | undefined = payment.externalReference

  switch (event) {
    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED": {
      await db
        .from("assinaturas")
        .update({ status: "pago" })
        .eq("asaas_payment_id", payment.id)

      if (feiranteId) {
        const expiraEm = new Date()
        expiraEm.setDate(expiraEm.getDate() + 30)
        await db
          .from("profiles")
          .update({
            assinatura_status:    "ativa",
            assinatura_expira_em: expiraEm.toISOString(),
          })
          .eq("id", feiranteId)
      }
      break
    }

    case "PAYMENT_OVERDUE": {
      await db
        .from("assinaturas")
        .update({ status: "expirado" })
        .eq("asaas_payment_id", payment.id)

      if (feiranteId) {
        // Suspende só se não há outra assinatura ativa
        const { data: ativas } = await db
          .from("assinaturas")
          .select("id")
          .eq("feirante_id", feiranteId)
          .eq("status", "pago")
          .limit(1)

        if (!ativas || ativas.length === 0) {
          await db
            .from("profiles")
            .update({ assinatura_status: "suspensa" })
            .eq("id", feiranteId)
        }
      }
      break
    }

    case "PAYMENT_REFUNDED":
    case "PAYMENT_DELETED":
    case "PAYMENT_CHARGEBACK_REQUESTED":
    case "PAYMENT_CHARGEBACK_DISPUTE": {
      await db
        .from("assinaturas")
        .update({ status: "estornado" })
        .eq("asaas_payment_id", payment.id)
      break
    }
  }

  return Response.json({ received: true })
}
