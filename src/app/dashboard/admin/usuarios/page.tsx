import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nome, email, roles, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuários</h1>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">E-mail</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.nome ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.roles?.map((r: string) => (
                      <span key={r} className="inline-block bg-orange-50 text-[#E8560A] text-xs px-2 py-0.5 rounded-full font-medium mr-1">{r}</span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}