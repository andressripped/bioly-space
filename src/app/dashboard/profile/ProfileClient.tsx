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
import UpgradeModal from "@/components/UpgradeModal";
import { BIOLY_TEMPLATES, TemplateConfig } from "@/lib/templates";
import { FONT_OPTIONS, FONT_CLASSES } from "@/lib/fonts";

type Device = "desktop" | "tablet" | "mobile";

// ─── Shared style utilities (mirror of ProfileView) ───────────────────────────
export const BUTTON_STYLE_MAP: Record<string, string> = {
  rounded: "rounded-2xl",
  pill:    "rounded-full",
  square:  "rounded-md",
  outline: "rounded-2xl",
  card:    "rounded-3xl",
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
  { id: "card",    label: "Tarjeta (Card)" },
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
  
  // Premium
  const [userPlan, setUserPlan] = useState("free");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState("");

  // Appearance
  const [templateId, setTemplateId]             = useState("default");
  const [backgroundType, setBackgroundType]     = useState<"solid" | "gradient" | "image" | "animated" | "image_fade">("solid");
  const [backgroundValue, setBackgroundValue]   = useState("#fcfcfc");
  const [backgroundBlur, setBackgroundBlur]     = useState(0);
  const [layoutMode, setLayoutMode]             = useState<"classic" | "creator_fade">("classic");

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
          setTemplateId(profile.template_id || "default");
          setBackgroundType(profile.background_type || "solid");
          setBackgroundValue(profile.background_value || "#fcfcfc");
          setBackgroundBlur(profile.background_blur || 0);
          setLayoutMode(profile.layout_mode || "classic");
          setSeoTitle(profile.seo_title || "");
          setSeoDescription(profile.seo_description || "");
          setUserPlan(profile.plan || "free");
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
        template_id:  templateId,
        background_type: backgroundType,
        background_value: backgroundValue,
        background_blur: backgroundBlur,
        layout_mode: layoutMode,
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

  const handlePremiumFeatureClick = (featureName: string) => {
    if (userPlan === "free") {
      setUpgradeFeatureName(featureName);
      setIsUpgradeModalOpen(true);
      return true; // indicates it was blocked
    }
    return false; // allowed
  };

  const handleSelectTemplate = (template: TemplateConfig) => {
    if (template.tier === "pro" && userPlan === "free") {
      handlePremiumFeatureClick(`Plantilla ${template.name}`);
      return;
    }
    if (template.tier === "business" && userPlan !== "business") {
      handlePremiumFeatureClick(`Plantilla ${template.name}`);
      return;
    }
    setTemplateId(template.id);
    setThemeColor(template.theme_color);
    setButtonStyle(template.button_style);
    setFontFamily(template.font_family);
    setBackgroundType(template.background_type);
    setBackgroundValue(template.background_value);
    setBackgroundBlur(template.background_blur);
    setLayoutMode(template.layout_mode || "classic");
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
  const isCard = buttonStyle === "card";
  const fontClass = FONT_CLASSES[fontFamily] || FONT_CLASSES["inter"];

  const socialLinks = links.filter(l => l.is_social);
  const mainLinks = links.filter(l => !l.is_social);

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
              <div className="pt-4 border-t border-[#eeeeee] dark:border-[#222] relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">SEO & Metadatos</h3>
                  {userPlan === "free" && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">PRO</span>}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Título de la página (SEO)</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => {
                        if (handlePremiumFeatureClick("Controles SEO")) return;
                        setSeoTitle(e.target.value);
                      }}
                      onClick={() => handlePremiumFeatureClick("Controles SEO")}
                      readOnly={userPlan === "free"}
                      className={`w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all text-sm ${userPlan === "free" ? "opacity-50 cursor-not-allowed" : ""}`}
                      placeholder={`${displayName || username} | Bioly`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Descripción (SEO)</label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => {
                        if (handlePremiumFeatureClick("Controles SEO")) return;
                        setSeoDescription(e.target.value);
                      }}
                      onClick={() => handlePremiumFeatureClick("Controles SEO")}
                      readOnly={userPlan === "free"}
                      className={`w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all text-sm resize-none ${userPlan === "free" ? "opacity-50 cursor-not-allowed" : ""}`}
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
              {/* Templates */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-3">Plantillas (Templates)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BIOLY_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                        templateId === tpl.id ? "border-[#111111] dark:border-white bg-gray-50 dark:bg-[#111]" : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#555]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner" style={{ background: tpl.background_type === "gradient" ? tpl.background_value : tpl.background_type === "solid" ? tpl.background_value : "#fff" }}>
                        <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: tpl.theme_color }} />
                      </div>
                      <span className="text-[10px] font-bold truncate w-full text-center text-[#555] dark:text-[#ccc]">{tpl.name}</span>
                      {tpl.tier !== "free" && (
                        <span className="absolute top-1 right-1 text-[8px] font-bold bg-gray-200 dark:bg-gray-800 text-[#555] dark:text-[#a1a1aa] px-1.5 py-0.5 rounded-sm uppercase tracking-widest">{tpl.tier}</span>
                      )}
                      {templateId === tpl.id && (
                        <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white dark:text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fondo (Background) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-3">Fondo</label>
                <div className="flex gap-2 mb-3">
                  {(["solid", "gradient"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setBackgroundType(type);
                        setTemplateId("custom");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${backgroundType === type ? "border-[#111111] dark:border-white text-[#111111] dark:text-white" : "border-[#eeeeee] dark:border-[#222] text-[#999999] hover:border-[#ccc]"}`}
                    >
                      {type === "solid" ? "Color Sólido" : "Gradiente"}
                    </button>
                  ))}
                </div>
                {backgroundType === "solid" && (
                  <div className="flex items-center gap-3">
                    <label className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer border-2 border-[#eeeeee] dark:border-[#333]">
                      <div className="w-full h-full" style={{ backgroundColor: backgroundValue.startsWith("#") ? backgroundValue : "#ffffff" }} />
                      <input type="color" value={backgroundValue.startsWith("#") ? backgroundValue : "#ffffff"} onChange={(e) => { setBackgroundValue(e.target.value); setTemplateId("custom"); }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </label>
                    <span className="text-xs text-[#999999] font-mono">{backgroundValue}</span>
                  </div>
                )}
                {backgroundType === "gradient" && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={backgroundValue}
                      onChange={(e) => { setBackgroundValue(e.target.value); setTemplateId("custom"); }}
                      placeholder="e.g. linear-gradient(to right, #ff7e5f, #feb47b)"
                      className="w-full text-xs font-mono bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-xl py-3 px-4 focus:outline-none focus:border-[#111111] dark:focus:border-white"
                    />
                    <div className="w-full h-12 rounded-xl border-2 border-[#eeeeee] dark:border-[#222]" style={{ background: backgroundValue }} />
                  </div>
                )}
              </div>

              {/* Theme Color */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-3">Color de Acento (Botones / Letras)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setThemeColor(c); setTemplateId("custom"); }}
                      className={`w-9 h-9 rounded-full transition-all border-2 ${
                        themeColor === c ? "ring-2 ring-offset-2 ring-[#111] dark:ring-white scale-110 border-white" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-[#eeeeee] dark:border-[#333] hover:scale-105 transition-all" title="Color personalizado">
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: themeColor }} />
                    <input type="color" value={themeColor} onChange={(e) => { setThemeColor(e.target.value); setTemplateId("custom"); }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </label>
                </div>
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
                        onClick={() => { setButtonStyle(style.id); setTemplateId("custom"); }}
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
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#999999]">Tipografía</label>
                  {userPlan === "free" && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">PRO</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        if (font.tier !== "free" && userPlan === "free") {
                          handlePremiumFeatureClick(`Fuente ${font.label}`);
                          return;
                        }
                        if (font.tier === "business" && userPlan !== "business") {
                          handlePremiumFeatureClick(`Fuente ${font.label}`);
                          return;
                        }
                        setFontFamily(font.id);
                        setTemplateId("custom");
                      }}
                      className={`relative p-3 rounded-2xl border-2 transition-all overflow-hidden ${
                        fontFamily === font.id ? "border-[#111111] dark:border-white bg-gray-50 dark:bg-[#111]" : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#555]"
                      }`}
                    >
                      <p className={`text-2xl font-bold ${FONT_CLASSES[font.id] || ""}`}>Aa</p>
                      <p className="text-[10px] text-[#999999] mt-1 uppercase tracking-wide truncate">{font.label}</p>
                      {font.tier !== "free" && (
                        <span className="absolute top-1 right-1 text-[8px] font-bold bg-gray-200 dark:bg-gray-800 text-[#555] dark:text-[#a1a1aa] px-1.5 py-0.5 rounded-sm uppercase tracking-widest">{font.tier}</span>
                      )}
                      {fontFamily === font.id && (
                        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
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
              className={`transition-all duration-500 ease-in-out shadow-2xl overflow-hidden border border-black/5 flex flex-col relative
                ${activeDevice === "desktop" ? "w-full max-w-2xl h-[600px] rounded-xl"              : ""}
                ${activeDevice === "tablet"  ? "w-[500px] h-[700px] rounded-[3rem] border-[10px] border-[#111]" : ""}
                ${activeDevice === "mobile"  ? "w-[320px] h-[640px] rounded-[3rem] border-[10px] border-[#111]" : ""}
              `}
              style={{
                background: backgroundType === "gradient" ? backgroundValue : backgroundType === "solid" ? backgroundValue : "#000000",
              }}
            >
              <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10 ${fontClass}`}>
                {/* Banner */}
                {backgroundType === "solid" && (
                  <div className="w-full h-28 transition-colors duration-300" style={{ backgroundColor: themeColor }} />
                )}
                {backgroundType === "gradient" && (
                  <div className="w-full h-12" /> // spacer instead of solid banner for gradients
                )}
                {backgroundType === "image_fade" && (
                  <div className="absolute top-0 left-0 w-full h-[60%] z-0">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundValue})` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
                  </div>
                )}

                {/* Content */}
                <div className={`px-5 text-center pb-16 relative z-10 ${backgroundType === "solid" ? "-mt-10" : backgroundType === "image_fade" ? "pt-24" : "mt-4"}`}>
                  {/* Avatar */}
                  <div className={`w-20 h-20 mx-auto rounded-full p-1 shadow-lg mb-3 border ${backgroundType === "image_fade" ? "bg-white/10 backdrop-blur-md border-white/20" : "bg-white dark:bg-[#0a0a0a] border-black/5"}`}>
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-8 h-8 text-[#999]" /></div>
                      }
                    </div>
                  </div>

                  <h2 className="text-lg font-bold dark:text-white mb-1">{displayName || "Tu Nombre"}</h2>
                  <p className="text-xs text-[#555555] dark:text-[#a1a1aa] mb-6 leading-relaxed">{bio || "Tu biografía..."}</p>

                  {/* SOCIAL BUBBLES */}
                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-[260px] mx-auto">
                      {socialLinks.map((link) => (
                        <div
                          key={link.id}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg border border-black/5 dark:border-white/10"
                          style={{
                            background: link.icon === 'instagram' ? 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'
                              : link.icon === 'tiktok' ? '#000000'
                              : link.icon === 'snapchat' ? '#FFFC00'
                              : link.icon === 'youtube' ? '#FF0000'
                              : link.icon === 'whatsapp' ? '#25D366'
                              : link.icon === 'spotify' ? '#1DB954'
                              : link.icon === 'facebook' ? '#1877F2'
                              : link.icon === 'twitter' ? '#000000'
                              : themeColor,
                            color: link.icon === 'snapchat' ? '#000' : '#fff'
                          }}
                        >
                          <PlatformIcon id={link.icon} className="w-5 h-5" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Links — EXACTLY matching ProfileView rendering */}
                  <div className={`w-full max-w-[260px] mx-auto ${isCard ? "grid grid-cols-2 gap-3" : "space-y-2.5"}`}>
                    {mainLinks.length > 0 ? mainLinks.map((link) => (
                      <div
                        key={link.id}
                        className={
                          isCard
                            ? `group relative aspect-[4/5] w-full overflow-hidden flex flex-col justify-end transition-all duration-300 ${btnClass} shadow-xl border border-white/10`
                            : `w-full flex items-center gap-3 px-4 py-3.5 border transition-all ${btnClass} ${
                                isOutline
                                  ? "border-2 bg-transparent"
                                  : "bg-[#111111] dark:bg-white border-transparent"
                              }`
                        }
                        style={!isCard && isOutline ? { borderColor: themeColor, color: themeColor } : {}}
                      >
                        {isCard ? (
                          <>
                            <div className="absolute inset-0 bg-gray-800">
                              <img src={link.thumbnail_url || `https://source.unsplash.com/random/400x500?${link.title}`} className="w-full h-full object-cover opacity-80" alt={link.title} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="relative z-10 p-3 w-full text-center">
                              <div className="w-6 h-6 mx-auto mb-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                                <PlatformIcon id={link.icon} className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-bold text-white text-[10px] line-clamp-2 leading-tight">
                                {link.title}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <PlatformIcon
                              id={link.icon}
                              className={`w-4 h-4 flex-shrink-0 ${isOutline ? "" : "text-white dark:text-black"}`}
                            />
                            <span className={`text-xs font-bold truncate flex-1 text-left ${isOutline ? "" : "text-white dark:text-black"}`}>
                              {link.title}
                            </span>
                          </>
                        )}
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

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName={upgradeFeatureName} 
      />
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
