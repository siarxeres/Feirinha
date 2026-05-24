import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";

export default async function AdminFeirasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  const { data: feiras } = await supabase
    .from("feiras")
    .select("id, nome, status, created_at")
    .order("created_at", { ascending: false });

  const statusColor: Record<string, string> = {
    aprovada: "bg-green-50 text-green-600",
    pendente: "bg-yellow-50 text-yellow-600",
    rejeitada: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Feiras</h1>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Criada em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feiras?.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{f.nome}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[f.status] ?? "bg-gray-50 text-gray-600"}`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(f.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}