import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";
import { Pencil, Trash2, Plus } from "lucide-react";

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nome, icone, cor, ativo")
    .order("nome", { ascending: true });

  const lista = (categorias ?? []) as {
    id: string;
    nome: string;
    icone: string | null;
    cor: string | null;
    ativo: boolean;
  }[];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#E8560A" }}
          >
            <Plus size={16} />
            Nova Categoria
          </button>
        </div>
        <p className="text-gray-500 mb-8">Categorias disponíveis para classificar feiras e produtos</p>

        {lista.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center border border-gray-200">
            <p className="text-gray-400 text-sm">Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lista.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                {/* Ícone + nome */}
                <div className="flex items-center gap-3">
                  {cat.icone && (
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: cat.cor ? `${cat.cor}22` : "#f3f4f6", color: cat.cor ?? "#6b7280" }}
                    >
                      {cat.icone}
                    </span>
                  )}
                  <span className="font-semibold text-gray-900 leading-tight">{cat.nome}</span>
                </div>

                {/* Cor + status */}
                <div className="flex items-center gap-2">
                  {cat.cor && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block border border-gray-200"
                        style={{ backgroundColor: cat.cor }}
                      />
                      {cat.cor}
                    </span>
                  )}
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                      cat.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil size={13} />
                    Editar
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
