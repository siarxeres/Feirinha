import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .maybeSingle();

  const rawRoles = profile?.roles
  let roles: string[] = []

  if (Array.isArray(rawRoles)) {
    roles = rawRoles
  } else if (typeof rawRoles === 'string') {
    // Parse PostgreSQL array format: "{organizador}" -> ["organizador"]
    roles = rawRoles
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map(r => r.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }

  if (roles.includes("admin")) redirect("/dashboard/admin");
  if (roles.includes("organizador")) redirect("/dashboard/organizador");
  if (roles.includes("feirante")) redirect("/dashboard/feirante");
  redirect("/dashboard/consumidor");
}