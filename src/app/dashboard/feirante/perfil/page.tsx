import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BottomNav from "../_components/BottomNav";

export default async function PerfilFeirantePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg">Feirinhas</span>
        </div>
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-sm text-gray-500">Nome</label>
            <p className="font-medium">{profile?.full_name || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">E-mail</label>
            <p className="font-medium">{session.user.email}</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}