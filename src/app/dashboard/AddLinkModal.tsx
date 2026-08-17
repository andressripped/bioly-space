"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  PiX, PiLink, PiTextAa, PiGlobe, PiMagnifyingGlass, PiPlus, PiSpinner, PiImageSquare, PiLockKey, PiUsers, PiCaretDown, PiCaretUp
} from "react-icons/pi";
import { 
  SiInstagram, SiYoutube, SiTiktok, SiX, SiFacebook, 
  SiSpotify, SiTwitch, SiDiscord, SiWhatsapp, 
  SiTelegram, SiGithub, SiPinterest, SiSnapchat
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { LINK_PRICE_TIERS, isValidLinkPrice } from "@/lib/linkPricing";

interface Platform {
  id: string;
  name: string;
  icon: any;
  prefix: string;
  color: string;
  placeholder: string;
}

const PLATFORMS: Platform[] = [
  { id: "instagram", name: "Instagram", icon: SiInstagram, prefix: "instagram.com/", color: "#E4405F", placeholder: "tu_usuario" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, prefix: "youtube.com/@", color: "#FF0000", placeholder: "tu_canal" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, prefix: "tiktok.com/@", color: "#000000", placeholder: "tu_usuario" },
  { id: "twitter", name: "X / Twitter", icon: SiX, prefix: "x.com/", color: "#000000", placeholder: "tu_usuario" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, prefix: "facebook.com/", color: "#1877F2", placeholder: "tu_pagina" },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, prefix: "linkedin.com/in/", color: "#0A66C2", placeholder: "tu_perfil" },
  { id: "spotify", name: "Spotify", icon: SiSpotify, prefix: "open.spotify.com/user/", color: "#1DB954", placeholder: "tu_id" },
  { id: "twitch", name: "Twitch", icon: SiTwitch, prefix: "twitch.tv/", color: "#9146FF", placeholder: "tu_canal" },
  { id: "discord", name: "Discord", icon: SiDiscord, prefix: "discord.gg/", color: "#5865F2", placeholder: "invitacion" },
  { id: "whatsapp", name: "WhatsApp", icon: SiWhatsapp, prefix: "wa.me/", color: "#25D366", placeholder: "54911..." },
  { id: "telegram", name: "Telegram", icon: SiTelegram, prefix: "t.me/", color: "#26A5E4", placeholder: "tu_usuario" },
  { id: "github", name: "GitHub", icon: SiGithub, prefix: "github.com/", color: "#181717", placeholder: "tu_usuario" },
  { id: "pinterest", name: "Pinterest", icon: SiPinterest, prefix: "pinterest.com/", color: "#BD081C", placeholder: "tu_usuario" },
  { id: "snapchat", name: "Snapchat", icon: SiSnapchat, prefix: "snapchat.com/add/", color: "#FFFC00", placeholder: "tu_usuario" },
  { id: "custom", name: "Personalizado", icon: PiLink, prefix: "", color: "#666666", placeholder: "https://tu-link.com" },
];

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editLink?: any;
  defaultPaid?: boolean;
}

export function AddLinkModal({ isOpen, onClose, onSuccess, editLink, defaultPaid }: AddLinkModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(PLATFORMS[0]);
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSocial, setIsSocial] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [priceUsd, setPriceUsd] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscribers, setSubscribers] = useState<any[] | null>(null);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  const supabase = createClient();

  const loadSubscribers = async () => {
    if (!editLink) return;
    setLoadingSubscribers(true);
    try {
      const res = await fetch(`/api/links/subscribers?link_id=${editLink.id}`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch {
      setSubscribers([]);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShowSubscribers(false);
      setSubscribers(null);
      if (editLink) {
        setTitle(editLink.title || "");
        setIsSocial(editLink.is_social || false);
        setThumbnailUrl(editLink.thumbnail_url || "");
        setIsPaid(editLink.is_paid || false);
        setPriceUsd(editLink.price_usd != null ? String(editLink.price_usd) : "");

        const platform = PLATFORMS.find(p => p.id === editLink.icon) || PLATFORMS[0];
        setSelectedPlatform(platform);

        if (platform.id === "custom") {
          setHandle(editLink.url || "");
        } else {
          let url = editLink.url || "";
          url = url.replace(/^https?:\/\//i, "");
          url = url.replace(new RegExp(`^${platform.prefix}`, "i"), "");
          setHandle(url);
        }
      } else {
        setSelectedPlatform(PLATFORMS[0]);
        setTitle("");
        setHandle("");
        setIsSocial(false);
        setThumbnailUrl("");
        setIsPaid(!!defaultPaid);
        setPriceUsd("");
      }
      setError(null);
    }
  }, [isOpen, editLink, defaultPaid]);

  const filteredPlatforms = useMemo(() => {
    return PLATFORMS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No estás autenticado");

      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}-link-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setThumbnailUrl(publicUrl);
    } catch (err: any) {
      setError("Error al subir imagen: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No estás autenticado");

      let finalUrl = handle.trim();
      if (selectedPlatform.id !== "custom") {
        finalUrl = `https://${selectedPlatform.prefix}${finalUrl.replace(/^https?:\/\//, '').replace(selectedPlatform.prefix, '')}`;
      } else {
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = `https://${finalUrl}`;
        }
      }

      const finalTitle = title.trim() || selectedPlatform.name;

      if (isPaid && !isValidLinkPrice(Number(priceUsd))) {
        throw new Error("Elige uno de los precios disponibles para el link privado");
      }
      const finalPriceUsd = isPaid ? Number(priceUsd) : null;

      if (editLink) {
        const { error: updateError } = await supabase
          .from("links")
          .update({
            title: finalTitle,
            url: finalUrl,
            icon: selectedPlatform.id,
            is_social: isSocial,
            thumbnail_url: thumbnailUrl || null,
            is_paid: isPaid,
            price_usd: finalPriceUsd,
          })
          .eq("id", editLink.id);

        if (updateError) throw updateError;
      } else {
        const { data: maxPosData } = await supabase
          .from("links")
          .select("position")
          .eq("user_id", user.id)
          .order("position", { ascending: false })
          .limit(1)
          .single();
        const nextPosition = (maxPosData?.position ?? -1) + 1;

        const { error: insertError } = await supabase
          .from("links")
          .insert([
            {
              user_id: user.id,
              title: finalTitle,
              url: finalUrl,
              icon: selectedPlatform.id,
              is_active: true,
              position: nextPosition,
              is_social: isSocial,
              thumbnail_url: thumbnailUrl || null,
              is_paid: isPaid,
              price_usd: finalPriceUsd,
            }
          ]);

        if (insertError) throw insertError;
      }

      setTitle("");
      setHandle("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el enlace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-[#eeeeee] dark:border-[#222] flex justify-between items-center bg-white dark:bg-[#0a0a0a] z-10">
          <div>
            <h2 className="text-2xl font-serif text-[#111111] dark:text-white">{editLink ? "Editar enlace" : "Añadir enlace"}</h2>
            <p className="text-sm text-[#999999]">Selecciona una plataforma para empezar</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors cursor-pointer">
            <PiX className="w-5 h-5 text-[#999999]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <PiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input 
                type="text" 
                placeholder="Buscar plataforma..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all"
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {filteredPlatforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlatform(p);
                    setTitle("");
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all gap-2 group cursor-pointer ${
                    selectedPlatform.id === p.id 
                      ? "bg-[#111111] border-[#111111] text-white dark:bg-white dark:border-white dark:text-black scale-[1.02] shadow-lg shadow-black/10 dark:shadow-white/5" 
                      : "bg-[#f9fafb] dark:bg-[#111] border-[#eeeeee] dark:border-[#222] hover:border-[#111111] dark:hover:border-white"
                  }`}
                >
                  <p.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${selectedPlatform.id === p.id ? "" : "text-[#555555] dark:text-[#a1a1aa]"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2 ml-1">Título (Opcional)</label>
                <div className="relative">
                  <PiTextAa className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl py-4 pl-12 pr-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium"
                    placeholder={selectedPlatform.name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2 ml-1">
                  {selectedPlatform.id === "custom" ? "URL Completa" : "Tu usuario / handle"}
                </label>
                <div className="relative">
                  {selectedPlatform.id === "custom" ? (
                    <PiLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                  ) : (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#999999] dark:text-[#666]">
                      {selectedPlatform.id === "whatsapp" ? "wa.me/" : "@"}
                    </span>
                  )}
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className={`w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl py-4 pr-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium ${selectedPlatform.id === "custom" ? "pl-12" : (selectedPlatform.id === "whatsapp" ? "pl-16" : "pl-8")}`}
                    placeholder={selectedPlatform.placeholder}
                  />
                </div>
                {selectedPlatform.id !== "custom" && (
                  <p className="mt-2 text-[10px] text-[#999999] font-medium ml-1">
                    Se guardará como: <span className="text-[#111111] dark:text-white">{selectedPlatform.prefix}{handle || "..."}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <label className="flex items-center gap-3 p-4 border border-[#eeeeee] dark:border-[#222] rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <input
                  type="checkbox"
                  checked={isSocial}
                  onChange={(e) => setIsSocial(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#111111] focus:ring-[#111111]"
                />
                <div>
                  <span className="block text-sm font-bold text-[#111111] dark:text-white">Mostrar como "Bolita" social</span>
                  <span className="block text-xs text-[#999999]">Aparecerá en la fila superior (Ej: como el logo de IG o TikTok)</span>
                </div>
              </label>

              {!isSocial && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2 ml-1">
                    Imagen (Para Tarjetas)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="flex-1 bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl py-4 px-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all text-sm font-medium"
                      placeholder="URL o subir archivo..."
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-[54px] px-6 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] border border-[#eeeeee] dark:border-[#333] rounded-2xl flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                      title="Subir imagen"
                    >
                      {isUploading ? <PiSpinner className="w-5 h-5 text-[#111111] dark:text-white animate-spin" /> : <PiImageSquare className="w-5 h-5 text-[#111111] dark:text-white" />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 p-4 border border-[#eeeeee] dark:border-[#222] rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#111111] focus:ring-[#111111]"
                />
                <PiLockKey className="w-5 h-5 text-[#999999] flex-shrink-0" />
                <div>
                  <span className="block text-sm font-bold text-[#111111] dark:text-white">Link privado (suscripción mensual)</span>
                  <span className="block text-xs text-[#999999]">Tus seguidores pagan cada mes para mantener el acceso. Ideal para grupos de Telegram/Discord.</span>
                </div>
              </label>

              {isPaid && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2 ml-1">
                    Precio mensual (USD)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LINK_PRICE_TIERS.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setPriceUsd(String(tier))}
                        className={`py-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                          Number(priceUsd) === tier
                            ? "bg-[#111111] border-[#111111] text-white dark:bg-white dark:border-white dark:text-black"
                            : "bg-[#f9fafb] dark:bg-[#111] border-[#eeeeee] dark:border-[#222] text-[#555] hover:border-[#111] dark:hover:border-white"
                        }`}
                      >
                        ${tier.toFixed(2)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-[#999999] font-medium ml-1">Precio fijo — al pagar, tus seguidores dejan su email y su nombre de Telegram para que sepas a quién agregar.</p>

                  {editLink && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !showSubscribers;
                          setShowSubscribers(next);
                          if (next && subscribers === null) loadSubscribers();
                        }}
                        className="w-full flex items-center justify-between p-4 border border-[#eeeeee] dark:border-[#222] rounded-2xl hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-sm font-bold text-[#111111] dark:text-white">
                          <PiUsers className="w-4 h-4" /> Ver suscriptores
                        </span>
                        {showSubscribers ? <PiCaretUp className="w-4 h-4 text-[#999999]" /> : <PiCaretDown className="w-4 h-4 text-[#999999]" />}
                      </button>

                      {showSubscribers && (
                        <div className="mt-2 border border-[#eeeeee] dark:border-[#222] rounded-2xl overflow-hidden">
                          {loadingSubscribers ? (
                            <div className="p-6 flex justify-center">
                              <PiSpinner className="w-5 h-5 animate-spin text-[#999999]" />
                            </div>
                          ) : subscribers && subscribers.length > 0 ? (
                            <div className="divide-y divide-[#eeeeee] dark:divide-[#222] max-h-64 overflow-y-auto">
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
                            <p className="p-6 text-center text-sm text-[#999999]">Todavía no hay suscriptores.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-5 rounded-3xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 flex items-center justify-center gap-3 text-lg cursor-pointer"
              >
                {loading ? <PiSpinner className="w-6 h-6 animate-spin" /> : <PiPlus className="w-6 h-6" />}
                {loading ? "Guardando..." : editLink ? "Guardar Cambios" : "Confirmar y Añadir"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
