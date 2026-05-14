"use client";

import { useState } from "react";
import { Search, Crown, Check, Loader2, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminClient({ profiles }: { profiles: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  const filteredProfiles = profiles.filter((p) => 
    (p.username && p.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.display_name && p.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleGrantPlan = async (profileId: string, plan: "pro" | "business", days: number) => {
    if (!confirm(`¿Activar plan ${plan.toUpperCase()} por ${days} días?`)) return;
    
    setLoadingId(profileId);
    
    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const { error } = await supabase
      .from("profiles")
      .update({
        plan: plan,
        subscription_expires_at: expiresAt.toISOString()
      })
      .eq("id", profileId);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      alert("¡Plan activado con éxito!");
      window.location.reload();
    }
    setLoadingId(null);
  };

  const handleRevokePlan = async (profileId: string) => {
    if (!confirm(`¿Revocar plan y volver a Free?`)) return;
    setLoadingId(profileId);
    const { error } = await supabase
      .from("profiles")
      .update({ plan: "free", subscription_expires_at: null })
      .eq("id", profileId);
    
    if (!error) window.location.reload();
    setLoadingId(null);
  };

  return (
    <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
          <input
            type="text"
            placeholder="Buscar por email, username o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#333] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] dark:bg-[#0a0a0a] border-b border-[#eeeeee] dark:border-[#222]">
            <tr>
              <th className="px-4 py-3 font-semibold text-[#555] dark:text-[#a1a1aa]">Usuario</th>
              <th className="px-4 py-3 font-semibold text-[#555] dark:text-[#a1a1aa]">Plan Actual</th>
              <th className="px-4 py-3 font-semibold text-[#555] dark:text-[#a1a1aa]">Expira</th>
              <th className="px-4 py-3 font-semibold text-[#555] dark:text-[#a1a1aa] text-right">Acciones (Otorgar)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeeeee] dark:divide-[#222]">
            {filteredProfiles.map((p) => {
              const isPremium = p.plan === "pro" || p.plan === "business";
              const isExpired = p.subscription_expires_at && new Date(p.subscription_expires_at) < new Date();
              
              return (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-base">{p.display_name || p.username}</div>
                    <div className="text-xs text-[#999]">{p.email || "Email no registrado"} • bioly.space/{p.username}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      p.plan === 'business' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      p.plan === 'pro' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {p.plan || 'Free'}
                    </span>
                    {isExpired && isPremium && <span className="ml-2 text-xs text-red-500 font-bold">(Expirado)</span>}
                  </td>
                  <td className="px-4 py-4 text-[#777]">
                    {p.subscription_expires_at ? new Date(p.subscription_expires_at).toLocaleDateString() : "---"}
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                    {loadingId === p.id ? (
                      <Loader2 className="w-5 h-5 animate-spin inline-block text-emerald-500" />
                    ) : (
                      <>
                        <button 
                          onClick={() => handleGrantPlan(p.id, "pro", 30)}
                          className="px-3 py-1.5 bg-[#111] dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
                        >
                          +30 Días PRO
                        </button>
                        <button 
                          onClick={() => handleGrantPlan(p.id, "business", 365)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                        >
                          +1 Año BIZ
                        </button>
                        {isPremium && (
                          <button 
                            onClick={() => handleRevokePlan(p.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                          >
                            Revocar
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProfiles.length === 0 && (
          <div className="p-10 text-center text-[#999]">No se encontraron perfiles.</div>
        )}
      </div>
    </div>
  );
}
