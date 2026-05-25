import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";
import { AprovacaoActions } from "./AprovacaoActions";

type ProfileRoles = { roles: string[] | null }
type Usuario = {
  id: string
  nome: string | null
  email: string
  roles: string[] | null
  created_at: string
  aprovacao_status: string | null
}

function aprovacaoBadge(status: string | null, roles: string[] | null) {
  if (!roles?.includes("feirante")) return null
  if (status === "aprovado")            return { label: "Aprovado",    cls: "bg-green-50 text-green-700" }
  if (status === "aguardando_aprovacao") return { label: "Aguardando", cls: "bg-yellow-50 text-yellow-700" }
  if (status === "rejeitado")           return { label: "Rejeitado",   cls: "bg-red-50 text-red-600" }
  return { label: "Pendente", cls: "bg-gray-100 text-gray-500" }
}

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profileRaw } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
  const profile = profileRaw as ProfileRoles | null;
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  const { data: usuariosRaw } = await supabase
    .from("profiles")
    .select("id, nome, email, roles, created_at, aprovacao_status")
    .order("created_at", { ascending: false });
  const usuarios = (usuariosRaw ?? []) as Usuario[];

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
                <th className="text-left px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Cadastro</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios?.map((u) => {
                const badge = aprovacaoBadge(u.aprovacao_status, u.roles)
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.nome ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.roles?.map((r: string) => (
                        <span key={r} className="inline-block bg-orange-50 text-[#E8560A] text-xs px-2 py-0.5 rounded-full font-medium mr-1">{r}</span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      {badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4">
                      <AprovacaoActions
                        feiranteId={u.id}
                        aprovacaoStatus={u.aprovacao_status}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
