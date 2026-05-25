import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "./_components/SideNav";
import { Users, Store, ClipboardList, Wrench } from "lucide-react";

type ProfileAdmin = { roles: string[] | null; nome: string | null }

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles, nome").eq("id", user.id).returns<ProfileAdmin[]>().single();
  if (!profile?.roles?.includes("admin")) redirect("/auth/login");
  const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("feiras").select("*", { count: "exact", head: true }),
    supabase.from("inscricoes").select("*", { count: "exact", head: true }),
  ]);
  const cards = [
    { icon: Users, label: "Usuarios", value: c1 ?? 0, color: "bg-blue-50 text-blue-600" },
    { icon: Store, label: "Feiras", value: c2 ?? 0, color: "bg-orange-50 text-orange-600" },
    { icon: ClipboardList, label: "Inscricoes", value: c3 ?? 0, color: "bg-green-50 text-green-600" },
    { icon: Wrench, label: "Servicos", value: 0, color: "bg-purple-50 text-purple-600" },
  ];
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-gray-500 mt-1">Bem-vindo, {profile?.nome ?? user.email}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}