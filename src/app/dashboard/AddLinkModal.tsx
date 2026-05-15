"use client";

import { useState, useMemo, useRef } from "react";
import { 
  X, Link as LinkIcon, Type, Globe, Search, PlusCircle, Loader2, ImagePlus
} from "lucide-react";
import { 
  SiInstagram, SiYoutube, SiTiktok, SiX, SiFacebook, 
  SiSpotify, SiTwitch, SiDiscord, SiWhatsapp, 
  SiTelegram, SiGithub, SiPinterest, SiSnapchat
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

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
  { id: "custom", name: "Personalizado", icon: LinkIcon, prefix: "", color: "#666666", placeholder: "https://tu-link.com" },
];

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLinkModal({ isOpen, onClose, onSuccess }: AddLinkModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(PLATFORMS[0]);
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSocial, setIsSocial] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

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

      // Calculate the next position value
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
          }
        ]);

      if (insertError) throw insertError;

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
            <h2 className="text-2xl font-serif text-[#111111] dark:text-white">Añadir enlace</h2>
            <p className="text-sm text-[#999999]">Selecciona una plataforma para empezar</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#999999]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Selector de Plataforma */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
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
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all gap-2 group ${
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
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
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
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
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
                      className="h-[54px] px-6 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] border border-[#eeeeee] dark:border-[#333] rounded-2xl flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Subir imagen"
                    >
                      {isUploading ? <Loader2 className="w-5 h-5 text-[#111111] dark:text-white animate-spin" /> : <ImagePlus className="w-5 h-5 text-[#111111] dark:text-white" />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-5 rounded-3xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
                {loading ? "Guardando..." : "Confirmar y Añadir"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
