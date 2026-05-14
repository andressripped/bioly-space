"use client";

import { useState, useEffect, useRef } from "react";
import {
  Monitor, Tablet, Smartphone, Camera, Save, ArrowLeft,
  Loader2, Copy, Check, ExternalLink, Eye, Pencil, Palette,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";
import { QRCodeCanvas } from "qrcode.react";

type Device = "desktop" | "tablet" | "mobile";

// ─── Shared style utilities (mirror of ProfileView) ───────────────────────────
export const BUTTON_STYLE_MAP: Record<string, string> = {
  rounded: "rounded-2xl",
  pill:    "rounded-full",
  square:  "rounded-md",
  outline: "rounded-2xl",
};

export const FONT_MAP: Record<string, string> = {
  inter: "font-sans",
  serif: "font-serif",
  mono:  "font-mono",
};

const THEME_COLORS = [
  "#111111", "#6366f1", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#0ea5e9",
];

const BUTTON_STYLES = [
  { id: "rounded", label: "Redondeado" },
  { id: "pill",    label: "Píldora"    },
  { id: "square",  label: "Cuadrado"  },
  { id: "outline", label: "Outline"   },
];

const FONTS = [
  { id: "inter", label: "Inter", style: "font-sans" },
  { id: "serif", label: "Serif", style: "font-serif" },
  { id: "mono",  label: "Mono",  style: "font-mono"  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileClient({ user }: { user: any }) {
  const [activeDevice, setActiveDevice] = useState<Device>("mobile");
  const [mobileTab, setMobileTab]       = useState<"edit" | "preview">("edit");
  const [activeSection, setActiveSection] = useState<"identity" | "appearance">("identity");
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const [copied, setCopied]             = useState(false);

  // Identity
  const [username, setUsername]         = useState(user.user_metadata?.username || "");
  const [displayName, setDisplayName]   = useState("");
  const [bio, setBio]                   = useState("");
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null);
  const [seoTitle, setSeoTitle]         = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Appearance
  const [themeColor, setThemeColor]     = useState("#111111");
  const [buttonStyle, setButtonStyle]   = useState("rounded");
  const [fontFamily, setFontFamily]     = useState("inter");

  // Links (for preview only)
  const [links, setLinks]               = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setDisplayName(profile.display_name || "");
          setBio(profile.bio || "");
          setAvatarUrl(profile.avatar_url || null);
          setThemeColor(profile.theme_color || "#111111");
          setButtonStyle(profile.button_style || "rounded");
          setFontFamily(profile.font_family || "inter");
          setSeoTitle(profile.seo_title || "");
          setSeoDescription(profile.seo_description || "");
          if (profile.username) setUsername(profile.username);
        } else {
          setDisplayName(user.user_metadata?.full_name || "");
        }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      setError("Error al subir imagen: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id:           user.id,
        username,
        display_name: displayName,
        bio,
        avatar_url:   avatarUrl,
        theme_color:  themeColor,
        button_style: buttonStyle,
        font_family:  fontFamily,
        seo_title:    seoTitle,
        seo_description: seoDescription,
        updated_at:   new Date().toISOString(),
      });
      if (upsertErr) throw upsertErr;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${username}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Derived style classes used in BOTH preview and public page
  const btnClass = BUTTON_STYLE_MAP[buttonStyle] ?? "rounded-2xl";
  const isOutline = buttonStyle === "outline";
  const fontClass = FONT_MAP[fontFamily] ?? "font-sans";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-[#111111] dark:text-white" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#fcfcfc] dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] transition-colors duration-300 ${fontClass}`}>

      {/* ── MOBILE TAB TOGGLE (bottom) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-white dark:bg-[#0a0a0a] border-t border-[#eeeeee] dark:border-[#222] shadow-lg safe-area-bottom">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            mobileTab === "edit" ? "text-[#111111] dark:text-white border-t-2 border-[#111111] dark:border-white" : "text-[#999999] border-t-2 border-transparent"
          }`}
        >
          <Pencil className="w-4 h-4" /> Editar
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            mobileTab === "preview" ? "text-[#111111] dark:text-white border-t-2 border-[#111111] dark:border-white" : "text-[#999999] border-t-2 border-transparent"
          }`}
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">

        {/* ── LEFT PANEL: SETTINGS ── */}
        <aside className={`w-full md:w-[420px] bg-white dark:bg-[#0a0a0a] border-r border-[#eeeeee] dark:border-[#222] overflow-y-auto shadow-sm z-20 pb-24 md:pb-4 flex flex-col ${
          mobileTab === "edit" ? "flex" : "hidden md:flex"
        }`}>
          {/* Header */}
          <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-[#eeeeee] dark:border-[#222]">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">Editar Perfil</h1>
            </div>
            {/* Public link */}
            <div className="flex items-center gap-1">
              <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-lg transition-colors text-[#999999] hover:text-[#111111] dark:hover:text-white">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a href={`/${username}`} target="_blank" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-lg transition-colors text-[#999999] hover:text-[#111111] dark:hover:text-white">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex border-b border-[#eeeeee] dark:border-[#222] mx-8 mt-4">
            <button
              onClick={() => setActiveSection("identity")}
              className={`flex items-center gap-2 pb-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                activeSection === "identity" ? "border-[#111111] dark:border-white text-[#111111] dark:text-white" : "border-transparent text-[#999999] hover:text-[#555]"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" /> Identidad
            </button>
            <button
              onClick={() => setActiveSection("appearance")}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeSection === "appearance" ? "border-[#111111] dark:border-white text-[#111111] dark:text-white" : "border-transparent text-[#999999] hover:text-[#555]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Apariencia
            </button>
          </div>

          {/* ── Section: IDENTITY ── */}
          {activeSection === "identity" && (
            <div className="flex-1 px-8 py-6 space-y-6">
              {/* Feedback */}
              {error && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/30">{error}</p>}
              {success && <p className="text-emerald-600 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/10 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900/30">✓ Cambios guardados exitosamente</p>}

              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#111] border-2 border-[#eeeeee] dark:border-[#333] overflow-hidden flex items-center justify-center">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      : <UserIcon className="w-10 h-10 text-[#999999]" />
                    }
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <p className="text-xs text-[#999999] font-medium">Pulsa para cambiar foto</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Username (URL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#999999]">bioly.space/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 pl-[95px] pr-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Nombre público</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium"
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Biografía</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium resize-none"
                  placeholder="Cuéntale al mundo quién eres..."
                />
              </div>

              {/* SEO Controls */}
              <div className="pt-4 border-t border-[#eeeeee] dark:border-[#222]">
                <h3 className="text-sm font-bold mb-4">SEO & Metadatos</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Título de la página (SEO)</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all text-sm"
                      placeholder={`${displayName || username} | Bioly`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Descripción (SEO)</label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all text-sm resize-none"
                      placeholder="Breve descripción que aparecerá en Google y al compartir el link."
                    />
                  </div>
                </div>
              </div>

              {/* QR Code Generator */}
              <div className="pt-4 border-t border-[#eeeeee] dark:border-[#222]">
                <h3 className="text-sm font-bold mb-4">Tu Código QR</h3>
                <div className="flex items-center gap-6 bg-[#f9fafb] dark:bg-[#111] p-4 rounded-2xl border border-[#eeeeee] dark:border-[#222]">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <QRCodeCanvas 
                      id="qr-code" 
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://bioly.space'}/${username}`} 
                      size={100} 
                      level="H" 
                      includeMargin={false} 
                      fgColor="#111111" 
                    />
                  </div>
                  <div>
                    <p className="text-sm text-[#555555] dark:text-[#a1a1aa] mb-3">
                      Descarga este QR para imprimirlo en tarjetas de presentación o flyers.
                    </p>
                    <button 
                      onClick={downloadQR}
                      className="text-xs font-bold uppercase tracking-widest bg-[#111111] dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Descargar PNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section: APPEARANCE ── */}
          {activeSection === "appearance" && (
            <div className="flex-1 px-8 py-6 space-y-8">
              {/* Theme Color */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-3">Color del banner</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setThemeColor(c)}
                      className={`w-9 h-9 rounded-full transition-all border-2 ${
                        themeColor === c ? "ring-2 ring-offset-2 ring-[#111] dark:ring-white scale-110 border-white" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-[#eeeeee] dark:border-[#333] hover:scale-105 transition-all" title="Color personalizado">
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: themeColor }} />
                    <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </label>
                </div>
                <p className="text-xs text-[#999999] mt-2 font-mono">{themeColor.toUpperCase()}</p>
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-3">Forma de los botones</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUTTON_STYLES.map((style) => {
                    const cls = BUTTON_STYLE_MAP[style.id];
                    const isOtl = style.id === "outline";
                    const isSelected = buttonStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setButtonStyle(style.id)}
                        className={`relative p-3 border-2 transition-all ${cls} ${
                          isSelected ? "border-[#111111] dark:border-white" : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#555]"
                        }`}
                        style={isSelected ? { backgroundColor: isOtl ? "transparent" : "#111111", color: isOtl ? "#111111" : "#ffffff" } : {}}
                      >
                        <span className="text-sm font-semibold">{style.label}</span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white dark:text-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-3">Tipografía</label>
                <div className="grid grid-cols-3 gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setFontFamily(font.id)}
                      className={`relative p-3 rounded-2xl border-2 transition-all ${
                        fontFamily === font.id ? "border-[#111111] dark:border-white" : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#555]"
                      }`}
                    >
                      <p className={`text-2xl font-bold ${font.style}`}>Aa</p>
                      <p className="text-[10px] text-[#999999] mt-1 uppercase tracking-wide">{font.label}</p>
                      {fontFamily === font.id && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white dark:text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="px-8 pb-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saving ? "Guardando..." : success ? "¡Guardado!" : "Guardar Cambios"}
            </button>
          </div>
        </aside>

        {/* ── RIGHT PANEL: LIVE PREVIEW ── */}
        <main className={`flex-1 bg-[#f0f0f0] dark:bg-[#000] relative overflow-hidden flex-col items-center ${
          mobileTab === "preview" ? "flex" : "hidden md:flex"
        }`}>

          {/* Device selector */}
          <div className="absolute top-6 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border border-[#eeeeee] dark:border-[#222] rounded-full p-1 flex gap-1 z-10 shadow-sm">
            {(["desktop", "tablet", "mobile"] as Device[]).map((device) => (
              <button
                key={device}
                onClick={() => setActiveDevice(device)}
                className={`p-2 rounded-full transition-all ${activeDevice === device ? "bg-[#111111] text-white dark:bg-white dark:text-black shadow-md" : "text-[#999999] hover:text-[#111]"}`}
              >
                {device === "desktop" && <Monitor className="w-4 h-4" />}
                {device === "tablet"  && <Tablet   className="w-4 h-4" />}
                {device === "mobile"  && <Smartphone className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Preview frame */}
          <div className="flex-1 flex items-center justify-center w-full pt-20 pb-10 px-4">
            <div
              className={`transition-all duration-500 ease-in-out bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-hidden border border-black/5 flex flex-col
                ${activeDevice === "desktop" ? "w-full max-w-2xl h-[600px] rounded-xl"              : ""}
                ${activeDevice === "tablet"  ? "w-[500px] h-[700px] rounded-[3rem] border-[10px] border-[#111]" : ""}
                ${activeDevice === "mobile"  ? "w-[320px] h-[640px] rounded-[3rem] border-[10px] border-[#111]" : ""}
              `}
            >
              <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden ${fontClass}`}>
                {/* Banner */}
                <div className="w-full h-28 transition-colors duration-300" style={{ backgroundColor: themeColor }} />

                {/* Content */}
                <div className="px-5 -mt-10 text-center pb-16">
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto rounded-full bg-white dark:bg-[#0a0a0a] p-1 shadow-lg mb-3 border border-black/5">
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-8 h-8 text-[#999]" /></div>
                      }
                    </div>
                  </div>

                  <h2 className="text-lg font-bold dark:text-white mb-1">{displayName || "Tu Nombre"}</h2>
                  <p className="text-xs text-[#555555] dark:text-[#a1a1aa] mb-6 leading-relaxed">{bio || "Tu biografía..."}</p>

                  {/* Links — EXACTLY matching ProfileView rendering */}
                  <div className="space-y-2.5 max-w-[260px] mx-auto">
                    {links.length > 0 ? links.map((link) => (
                      <div
                        key={link.id}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 border transition-all ${btnClass} ${
                          isOutline
                            ? "border-2 bg-transparent"
                            : "bg-[#111111] dark:bg-white border-transparent"
                        }`}
                        style={isOutline ? { borderColor: themeColor, color: themeColor } : {}}
                      >
                        <PlatformIcon
                          id={link.icon}
                          className={`w-4 h-4 flex-shrink-0 ${isOutline ? "" : "text-white dark:text-black"}`}
                        />
                        <span className={`text-xs font-bold truncate flex-1 text-left ${isOutline ? "" : "text-white dark:text-black"}`}>
                          {link.title}
                        </span>
                      </div>
                    )) : (
                      // Placeholder links when empty
                      ["Link 1", "Link 2", "Link 3"].map((name, i) => (
                        <div
                          key={i}
                          className={`w-full flex items-center justify-center px-4 py-3.5 border transition-all opacity-40 ${btnClass} ${
                            isOutline ? "border-2 bg-transparent" : "bg-[#111111] border-transparent"
                          }`}
                          style={isOutline ? { borderColor: themeColor } : {}}
                        >
                          <span className={`text-xs font-bold ${isOutline ? "" : "text-white"}`}>{name}</span>
                        </div>
                      ))
                    )}
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
