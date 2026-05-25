import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";
import { CategoriasManager } from "./CategoriasManager";

type ProfileRoles = { roles: string[] | null }

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).returns<ProfileRoles[]>().single();
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">
        <CategoriasManager />
      </main>
    </div>
  );
}
