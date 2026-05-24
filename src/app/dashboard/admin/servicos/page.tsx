import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SideNav } from "../_components/SideNav";
import { Utensils, Palette, Shirt, Wrench, Music, Leaf } from "lucide-react";

const categorias = [
  { icon: Utensils, label: "Alimentação", color: "bg-orange-50 text-orange-500" },
  { icon: Palette,  label: "Artesanato",  color: "bg-purple-50 text-purple-500" },
  { icon: Shirt,    label: "Vestuário",   color: "bg-blue-50 text-blue-500" },
  { icon: Wrench,   label: "Serviços",    color: "bg-gray-50 text-gray-500" },
  { icon: Music,    label: "Cultura",     color: "bg-pink-50 text-pink-500" },
  { icon: Leaf,     label: "Orgânicos",   color: "bg-green-50 text-green-500" },
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Serviços</h1>
        <p className="text-gray-500 mb-8">Categorias de serviços disponíveis nas feiras</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map(({ icon: Icon, label, color }) => (
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