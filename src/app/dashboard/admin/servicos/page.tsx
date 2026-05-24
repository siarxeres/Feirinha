import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";
import { Zap, Droplets, Tent, UtensilsCrossed, Armchair, Snowflake, Flame } from "lucide-react";

const servicos = [
  { icon: Zap,             label: "Eletricista",               color: "bg-yellow-50 text-yellow-500" },
  { icon: Droplets,        label: "Encanador",                 color: "bg-blue-50 text-blue-500" },
  { icon: Tent,            label: "Instalador de Barracas",    color: "bg-orange-50 text-orange-500" },
  { icon: UtensilsCrossed, label: "Distribuidora de Mesas",   color: "bg-green-50 text-green-500" },
  { icon: Armchair,        label: "Distribuidora de Cadeiras", color: "bg-purple-50 text-purple-500" },
  { icon: Snowflake,       label: "Distribuidora de Gelo",    color: "bg-cyan-50 text-cyan-500" },
  { icon: Flame,           label: "Distribuidora de Carvão",  color: "bg-red-50 text-red-500" },
];

export default async function AdminServicosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
  if (!profile?.roles?.includes("admin")) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Serviços de Suporte</h1>
        <p className="text-gray-500 mb-8">Prestadores de serviço para infraestrutura das feiras</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {servicos.map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <span className="font-medium text-gray-900">{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}