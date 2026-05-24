import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "../_components/BottomNav";
import { MapPin } from "lucide-react";

export default async function MapaConsumidorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: feiras } = await supabase
    .from("feiras")
    .select("*")
    .eq("status", "aprovada");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <h1 className="text-2xl font-bold mb-6">Mapa de Feiras</h1>
        {!feiras || feiras.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center gap-3 text-gray-400">
            <MapPin className="w-10 h-10" />
            <p>Nenhuma feira aprovada para exibir no mapa.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feiras.map((feira) => (
              <div key={feira.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="font-medium">{feira.nome}</p>
                <p className="text-sm text-gray-500">{feira.endereco}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
