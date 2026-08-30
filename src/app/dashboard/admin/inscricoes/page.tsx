import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";

type ProfileRoles = { roles: string[] | null }
type Inscricao = {
  id: string
  status: string
  created_at: string
  feiras: { nome: string } | null
  profiles: { nome: string | null; email: string } | null
}

export default async function AdminInscricoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).returns<ProfileRoles[]>().single();
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  // Admin client bypassa RLS — a policy de "feiras" só libera SELECT pra
  // não-dono quando status = "publicada", então o embed feiras(nome) vinha
  // null pra feiras encerradas. Autorização já garantida pela checagem de
  // role admin acima.
  const admin = createAdminClient();
  const { data: inscricoesData } = await admin
    .from("inscricoes")
    .select("id, status, created_at, feiras(nome), profiles(nome, email)")
    .order("created_at", { ascending: false });
  const inscricoes = inscricoesData as Inscricao[] | null;

  const statusColor: Record<string, string> = {
    aprovada: "bg-green-50 text-green-600",
    pendente: "bg-yellow-50 text-yellow-600",
    rejeitada: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Inscrições</h1>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Feirante</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Feira</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inscricoes?.map((i: any) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{i.profiles?.nome ?? i.profiles?.email ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{i.feiras?.nome ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[i.status] ?? "bg-gray-50 text-gray-600"}`}>{i.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(i.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}