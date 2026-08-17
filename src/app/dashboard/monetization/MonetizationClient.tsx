"use client";

import { useState } from "react";
import { PiPlus, PiSpinner, PiUsers, PiCaretDown, PiCaretUp, PiPencilSimple, PiLockKey } from "react-icons/pi";
import { createClient } from "@/utils/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";
import { AddLinkModal } from "../AddLinkModal";

interface MonetizationClientProps {
  initialLinks: any[];
  userId: string;
}

function SubscribersPanel({ linkId }: { linkId: string }) {
  const [open, setOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links/subscribers?link_id=${linkId}`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch {
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = subscribers?.filter((s) => s.status === "active").length ?? null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && subscribers === null) load();
        }}
        className="w-full flex items-center justify-between p-3 border border-[#eeeeee] dark:border-[#222] rounded-xl hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-[#111111] dark:text-white">
          <PiUsers className="w-4 h-4" />
          {activeCount !== null ? `${activeCount} suscriptor${activeCount === 1 ? "" : "es"} activo${activeCount === 1 ? "" : "s"}` : "Ver suscriptores"}
        </span>
        {open ? <PiCaretUp className="w-4 h-4 text-[#999999]" /> : <PiCaretDown className="w-4 h-4 text-[#999999]" />}
      </button>

      {open && (
        <div className="mt-2 border border-[#eeeeee] dark:border-[#222] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-5 flex justify-center">
              <PiSpinner className="w-4 h-4 animate-spin text-[#999999]" />
            </div>
          ) : subscribers && subscribers.length > 0 ? (
            <div className="divide-y divide-[#eeeeee] dark:divide-[#222] max-h-60 overflow-y-auto">
              {subscribers.map((s, i) => (
                <div key={i} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111] dark:text-white truncate">{s.telegram_username || "(sin Telegram)"}</p>
                    <p className="text-xs text-[#999999] truncate">{s.email}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    s.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {s.status === "active" ? "Activo" : "Vencido"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-5 text-center text-sm text-[#999999]">Todavía no hay suscriptores.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MonetizationClient({ initialLinks, userId }: MonetizationClientProps) {
  const [links, setLinks] = useState<any[]>(initialLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const supabase = createClient();

  const refetch = async () => {
    const { data } = await supabase
      .from("links")
      .select("id, title, url, icon, is_paid, price_usd, position")
      .eq("user_id", userId)
      .eq("is_paid", true)
      .order("position", { ascending: true });
    setLinks(data || []);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Tus productos</h2>
          <p className="text-xs text-[#999999] mt-0.5">Links privados con suscripción mensual</p>
        </div>
        <button
          onClick={() => { setEditingLink(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md active:scale-[0.98] text-sm md:text-base cursor-pointer"
        >
          <PiPlus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Añadir producto</span>
          <span className="sm:hidden">Añadir</span>
        </button>
      </div>

      {links.length === 0 ? (
        <div className="p-10 md:p-16 border-2 border-dashed border-[#eeeeee] dark:border-[#222] rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#f9fafb] dark:bg-[#111] rounded-2xl flex items-center justify-center mb-6 border border-[#eeeeee] dark:border-[#333]">
            <PiLockKey className="w-8 h-8 text-[#999999]" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Aún no cobras por nada</h2>
          <p className="text-[#555555] dark:text-[#a1a1aa] mb-8 max-w-sm text-sm md:text-base">
            Crea tu primer link privado — por ejemplo, acceso a un grupo de Telegram — y empieza a cobrar una suscripción mensual.
          </p>
          <button
            onClick={() => { setEditingLink(null); setIsModalOpen(true); }}
            className="bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Crear mi primer producto
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#f9fafb] dark:bg-[#111] rounded-xl flex items-center justify-center border border-[#eeeeee] dark:border-[#222] flex-shrink-0">
                  <PlatformIcon id={link.icon} className="w-5 h-5 text-[#111111] dark:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#111111] dark:text-white truncate">{link.title}</h3>
                  <p className="text-xs text-[#999999] truncate">Link privado · ${Number(link.price_usd).toFixed(2)} USD/mes</p>
                </div>
                <button
                  onClick={() => { setEditingLink(link); setIsModalOpen(true); }}
                  className="p-2.5 text-[#555555] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  title="Editar"
                >
                  <PiPencilSimple className="w-4 h-4" />
                </button>
              </div>

              <SubscribersPanel linkId={link.id} />
            </div>
          ))}
        </div>
      )}

      <AddLinkModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLink(null); }}
        onSuccess={refetch}
        editLink={editingLink}
        defaultPaid={true}
      />
    </div>
  );
}
