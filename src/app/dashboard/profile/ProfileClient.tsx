"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor, Tablet, Smartphone, Camera, Save, ArrowLeft, Loader2, Copy, Check, ExternalLink, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";

type Device = "desktop" | "tablet" | "mobile";

export default function ProfileClient({ user }: { user: any }) {
  const [activeDevice, setActiveDevice] = useState<Device>("mobile");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#111111");
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState(user.user_metadata?.username || "");
  const [links, setLinks] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Cargar datos del perfil y enlaces
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setDisplayName(profileData.display_name || "");
          setBio(profileData.bio || "");
          setAvatarUrl(profileData.avatar_url || null);
          setThemeColor(profileData.theme_color || "#111111");
          if (profileData.username) setUsername(profileData.username);
        } else {
          setDisplayName(user.user_metadata?.username || "");
        }

        // 2. Enlaces
        const { data: linksData } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", user.id)
          .order("position", { ascending: true });

        setLinks(linksData || []);

      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manejar subida de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (err: any) {
      setError("Error al subir la imagen: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: username, // <-- ¡Faltaba esto!
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          theme_color: themeColor,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-[#111111] dark:text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] transition-colors duration-300">

      {/* MOBILE TAB TOGGLE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-white dark:bg-[#0a0a0a] border-t border-[#eeeeee] dark:border-[#222] shadow-lg">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            mobileTab === "edit"
              ? "text-[#111111] dark:text-white border-t-2 border-[#111111] dark:border-white"
              : "text-[#999999] border-t-2 border-transparent"
          }`}
        >
          <Pencil className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            mobileTab === "preview"
              ? "text-[#111111] dark:text-white border-t-2 border-[#111111] dark:border-white"
              : "text-[#999999] border-t-2 border-transparent"
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        
        {/* PANEL DE CONFIGURACIÓN (IZQUIERDA) */}
        <aside className={`w-full md:w-[400px] bg-white dark:bg-[#0a0a0a] border-r border-[#eeeeee] dark:border-[#222] overflow-y-auto p-8 shadow-sm z-20 pb-24 md:pb-8 ${
          mobileTab === "edit" ? "flex flex-col" : "hidden md:flex md:flex-col"
        }`}>
          <div className="flex items-center gap-4 mb-10">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Editar Perfil</h1>
          </div>

          <div className="space-y-8">
            {/* Public Link Section */}
            <div className="p-4 bg-[#f9fafb] dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#999999] mb-3">Tu enlace público</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-sm font-medium truncate text-[#555555] dark:text-[#a1a1aa]">
                  bioly.space/{username}
                </div>
                <div className="flex gap-1">
                  <button onClick={copyToClipboard} className="p-2 hover:bg-white dark:hover:bg-[#222] rounded-lg transition-all text-[#999999] hover:text-[#111111] dark:hover:text-white">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a href={`/${username}`} target="_blank" className="p-2 hover:bg-white dark:hover:bg-[#222] rounded-lg transition-all text-[#999999] hover:text-[#111111] dark:hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#111] border-2 border-[#eeeeee] dark:border-[#333] overflow-hidden flex items-center justify-center">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-[#999999]" />}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              <p className="text-xs text-[#999999] font-medium">Pulsa para cambiar imagen</p>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}
              {success && <p className="text-emerald-500 text-xs font-medium text-center">¡Cambios guardados!</p>}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Username (URL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#999999]">bioly.space/</span>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 pl-[90px] pr-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Nombre público</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Biografía</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium resize-none" placeholder="Cuéntale al mundo quién eres..." />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Color del tema</label>
                <div className="flex gap-2">
                  {["#111111", "#6366f1", "#10b981", "#f59e0b", "#ef4444"].map((color) => (
                    <button key={color} onClick={() => setThemeColor(color)} className={`w-8 h-8 rounded-full transition-all ${themeColor === color ? "ring-2 ring-offset-2 ring-[#111] dark:ring-white scale-110" : "opacity-70 hover:opacity-100"}`} style={{ backgroundColor: color }}></button>
                  ))}
                  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-8 h-8 rounded-full border-none p-0 overflow-hidden cursor-pointer bg-transparent" />
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-black/10 dark:shadow-white/5 hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </aside>

        {/* PANEL DE PREVISUALIZACIÓN (DERECHA) */}
        <main className={`flex-1 bg-[#f5f5f7] dark:bg-[#000] relative overflow-hidden flex-col items-center ${
          mobileTab === "preview" ? "flex" : "hidden md:flex"
        }`}>
          
          <div className="absolute top-8 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border border-[#eeeeee] dark:border-[#222] rounded-full p-1 flex gap-1 z-10 shadow-sm">
            {(["desktop", "tablet", "mobile"] as Device[]).map((device) => (
              <button key={device} onClick={() => setActiveDevice(device)} className={`p-2 rounded-full transition-all ${activeDevice === device ? "bg-[#111111] text-white dark:bg-white dark:text-black shadow-md" : "text-[#999999] hover:text-[#111]"}`}>
                {device === "desktop" && <Monitor className="w-5 h-5" />}
                {device === "tablet" && <Tablet className="w-5 h-5" />}
                {device === "mobile" && <Smartphone className="w-5 h-5" />}
              </button>
            ))}
          </div>

          <div className="flex-1 flex items-center justify-center w-full pt-20 pb-10">
            <div className={`transition-all duration-500 ease-in-out bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-hidden border border-black/5 dark:border-white/5 flex flex-col
              ${activeDevice === "desktop" ? "w-[90%] h-[80%] rounded-xl" : ""}
              ${activeDevice === "tablet" ? "w-[600px] h-[800px] rounded-[3rem] border-[12px] border-[#111]" : ""}
              ${activeDevice === "mobile" ? "w-[340px] h-[700px] rounded-[3.5rem] border-[12px] border-[#111]" : ""}
            `}>
              
              <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0a] relative">
                <div className="w-full h-32 transition-colors duration-500" style={{ backgroundColor: themeColor }}></div>
                <div className="px-6 -mt-10 text-center pb-20">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white dark:bg-[#0a0a0a] p-1 shadow-lg mb-4">
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#999999]"><UserIcon className="w-8 h-8" /></div>}
                    </div>
                  </div>
                  <h2 className="text-xl font-serif dark:text-white mb-1">{displayName || "Tu Nombre"}</h2>
                  <p className="text-sm text-[#555555] dark:text-[#a1a1aa] mb-8">{bio || "Tu biografía..."}</p>
                  
                  {/* LINKS EN PREVIEW */}
                  <div className="space-y-3 max-w-[280px] mx-auto">
                    {links.map((link) => (
                      <a 
                        key={link.id} 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#f9fafb] dark:bg-[#111] py-4 px-4 rounded-2xl border border-[#eeeeee] dark:border-[#222] flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer no-underline text-inherit"
                      >
                        <PlatformIcon id={link.icon} className="w-5 h-5 text-[#111111] dark:text-white" />
                        <span className="text-sm font-semibold truncate flex-1 text-left">{link.title}</span>
                      </a>
                    ))}
                    {links.length === 0 && [1, 2, 3].map(i => (
                      <div key={i} className="w-full bg-[#f9fafb] dark:bg-[#111] h-14 rounded-2xl border border-[#eeeeee] dark:border-[#222] opacity-50"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
