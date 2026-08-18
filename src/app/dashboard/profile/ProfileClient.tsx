"use client";

import { useState, useEffect, useRef } from "react";
import {
  PiDesktop, PiDeviceTablet, PiDeviceMobile, PiCamera, PiFloppyDisk, PiArrowLeft,
  PiSpinner, PiCopy, PiCheck, PiArrowSquareOut, PiEye, PiPencil, PiPalette,
  PiList, PiPlus, PiDotsSixVertical, PiTrash, PiShieldCheck, PiLock
} from "react-icons/pi";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";
import { QRCodeCanvas } from "qrcode.react";
import UpgradeModal from "@/components/UpgradeModal";
import SecurityScannerModal from "@/components/SecurityScannerModal";
import { AddLinkModal } from "../AddLinkModal";
import { BIOLY_TEMPLATES, TemplateConfig } from "@/lib/templates";
import { FONT_OPTIONS, FONT_CLASSES } from "@/lib/fonts";
import { renderWithAppleEmojis } from "@/utils/emoji";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { revalidateProfile } from "@/utils/revalidateProfile";

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

// ─── Sortable Link Item ───────────────────────────────────────────────────────
function SortableLinkItem({
  link,
  onDelete,
  onEdit,
}: {
  link: any;
  onDelete: (id: string) => void;
  onEdit: (link: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSensitive = ["onlyfans.com", "fansly.com", "patreon.com", "justforfans.com"].some(
    (domain) => link.url?.toLowerCase().includes(domain)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] p-3.5 rounded-xl transition-all shadow-sm ${
        isDragging
          ? "opacity-50 border-[#111111] dark:border-white shadow-2xl scale-[1.02] z-50"
          : "hover:border-[#d0d0d0] dark:hover:border-[#444]"
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-[#cccccc] dark:text-[#444] hover:text-[#111111] dark:hover:text-white transition-colors cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        aria-label="Arrastrar para ordenar"
      >
        <PiDotsSixVertical className="w-4 h-4" />
      </button>

      {/* Icon */}
      <div className="w-9 h-9 bg-[#f9fafb] dark:bg-[#111] rounded-lg flex items-center justify-center border border-[#eeeeee] dark:border-[#222] flex-shrink-0">
        <PlatformIcon id={link.icon} className="w-4 h-4 text-[#111111] dark:text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="font-semibold text-[#111111] dark:text-white truncate text-xs leading-none">{link.title}</h3>
          {link.is_social && (
            <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">Social</span>
          )}
          {isSensitive && (
            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-0.5">
              <PiShieldCheck className="w-2.5 h-2.5" /> Enmascarado
            </span>
          )}
        </div>
        <p className="text-[10px] text-[#999999] truncate mt-0.5">{link.url}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(link)}
          title="Editar Enlace"
          className="p-1 text-[#555555] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <PiPencil className="w-3.5 h-3.5" />
        </button>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-[#555555] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <PiArrowSquareOut className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={() => onDelete(link.id)}
          className="p-1 text-[#555555] dark:text-[#a1a1aa] hover:text-red-500 transition-colors"
        >
          <PiTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileClient({ user }: { user: any }) {
  const [activeDevice, setActiveDevice] = useState<Device>("mobile");
  const [mobileTab, setMobileTab]       = useState<"edit" | "preview">("edit");
  const [activeSection, setActiveSection] = useState<"identity" | "appearance" | "links">("identity");
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeEditLink, setActiveEditLink] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (!error) setLinks(data || []);
    revalidateProfile(username);
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este enlace?")) return;
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) {
      setLinks(links.filter((l) => l.id !== id));
      revalidateProfile(username);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);

    // Optimistic update
    setLinks(reordered);

    // Persist all positions to Supabase
    const updates = reordered.map((link, index) =>
      supabase.from("links").update({ position: index }).eq("id", link.id)
    );
    await Promise.all(updates);
    revalidateProfile(username);
  };


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
      revalidateProfile(username);
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
        <PiSpinner className="w-8 h-8 animate-spin text-[#111111] dark:text-white" />
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
          <PiPencil className="w-4 h-4" /> Editar
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            mobileTab === "preview" ? "text-[#111111] dark:text-white border-t-2 border-[#111111] dark:border-white" : "text-[#999999] border-t-2 border-transparent"
          }`}
        >
          <PiEye className="w-4 h-4" /> Preview
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">

        {/* ── LEFT PANEL: SETTINGS ── */}
        <aside className={`w-full md:w-[420px] bg-white dark:bg-[#0a0a0a] border-r border-[#eeeeee] dark:border-[#222] overflow-y-auto shadow-sm z-20 pb-24 md:pb-4 flex flex-col ${
          mobileTab === "edit" ? "flex" : "hidden md:flex"
        }`}>
          {/* Header */}
          <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-[#eeeeee] dark:border-[#222]">
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight">Editar Perfil</h1>
            </div>
            {/* Public link */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsScannerOpen(true)}
                title="Auditoría de Seguridad Cerrojo"
                className="p-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-colors text-amber-500 hover:text-amber-600 mr-1 flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-900/30"
              >
                <PiShieldCheck className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wide hidden sm:inline">Cerrojo</span>
              </button>
              <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-lg transition-colors text-[#999999] hover:text-[#111111] dark:hover:text-white">
                {copied ? <PiCheck className="w-4 h-4 text-emerald-500" /> : <PiCopy className="w-4 h-4" />}
              </button>
              <a href={`/${username}`} target="_blank" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-lg transition-colors text-[#999999] hover:text-[#111111] dark:hover:text-white">
                <PiArrowSquareOut className="w-4 h-4" />
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
              <PiPencil className="w-3.5 h-3.5" /> Identidad
            </button>
            <button
              onClick={() => setActiveSection("appearance")}
              className={`flex items-center gap-2 pb-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                activeSection === "appearance" ? "border-[#111111] dark:border-white text-[#111111] dark:text-white" : "border-transparent text-[#999999] hover:text-[#555]"
              }`}
            >
              <PiPalette className="w-3.5 h-3.5" /> Apariencia
            </button>
            <button
              onClick={() => setActiveSection("links")}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeSection === "links" ? "border-[#111111] dark:border-white text-[#111111] dark:text-white" : "border-transparent text-[#999999] hover:text-[#555]"
              }`}
            >
              <PiList className="w-3.5 h-3.5" /> Links
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
                    <PiCamera className="w-6 h-6 text-white" />
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
                          <PiCheck className="w-2 h-2 text-white dark:text-black" />
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
                            <PiCheck className="w-2.5 h-2.5 text-white dark:text-black" />
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
                          <PiCheck className="w-2.5 h-2.5 text-white dark:text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Section: LINKS ── */}
          {activeSection === "links" && (
            <div className="flex-1 px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-bold">Tus enlaces</h2>
                  {links.length > 1 && (
                    <p className="text-[10px] text-[#999999] mt-0.5">Arrastra para reordenar</p>
                  )}
                </div>
                <button
                  onClick={() => setIsAddLinkModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#111111] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-sm active:scale-[0.98] text-xs font-bold"
                >
                  <PiPlus className="w-3.5 h-3.5" />
                  <span>Añadir enlace</span>
                </button>
              </div>

              {links.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-3">
                      {links.map((link) => (
                        <SortableLinkItem key={link.id} link={link} onDelete={handleDeleteLink} onEdit={setActiveEditLink} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="py-10 border-2 border-dashed border-[#eeeeee] dark:border-[#222] rounded-[2rem] flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-[#555] dark:text-[#a1a1aa] mb-4">
                    Aún no tienes enlaces. ¡Añade tu primer enlace!
                  </p>
                  <button
                    onClick={() => setIsAddLinkModalOpen(true)}
                    className="bg-[#111111] dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-xs shadow-sm"
                  >
                    + Añadir enlace
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Save button */}
          {activeSection !== "links" && (
            <div className="px-8 pb-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <PiSpinner className="w-5 h-5 animate-spin" /> : success ? <PiCheck className="w-5 h-5" /> : <PiFloppyDisk className="w-5 h-5" />}
                {saving ? "Guardando..." : success ? "¡Guardado!" : "Guardar Cambios"}
              </button>
            </div>
          )}
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
                className="p-2 rounded-full transition-all cursor-pointer"
              >
                {device === "desktop" && <PiDesktop className="w-4 h-4" />}
                {device === "tablet"  && <PiDeviceTablet   className="w-4 h-4" />}
                {device === "mobile"  && <PiDeviceMobile className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Preview frame */}
          <div className="flex-1 flex items-center justify-center w-full pt-20 pb-10 px-4">
            <div
              key={activeDevice}
              className={`flex flex-col relative animate-in fade-in zoom-in-95 duration-200
                ${activeDevice === "desktop" ? "w-full max-w-3xl bg-[#e5e5e5] dark:bg-[#1a1a1a] rounded-t-xl rounded-b-md shadow-2xl overflow-hidden border border-black/10" : ""}
                ${activeDevice === "tablet"  ? "w-[440px] bg-gradient-to-b from-[#e9e9ec] to-[#d8d8dc] dark:from-[#2a2a2e] dark:to-[#161618] rounded-[3rem] p-4 shadow-2xl ring-1 ring-black/10" : ""}
                ${activeDevice === "mobile"  ? "w-[300px] bg-gradient-to-b from-[#3a3a3e] to-[#1c1c1e] rounded-[3.5rem] p-[14px] shadow-2xl ring-1 ring-black/40" : ""}
              `}
            >
              {/* Desktop: browser chrome */}
              {activeDevice === "desktop" && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#e5e5e5] dark:bg-[#1a1a1a] flex-shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 mx-4 bg-white dark:bg-[#0a0a0a] rounded-md px-3 py-1 text-xs text-[#666] dark:text-[#999] truncate text-center">
                    bioly.space/{username || "usuario"}
                  </div>
                </div>
              )}

              {/* Tablet: front camera dot centered in top bezel */}
              {activeDevice === "tablet" && (
                <div className="flex justify-center py-2.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] ring-[3px] ring-black/5 dark:ring-white/5" />
                </div>
              )}

              {/* Tablet: side buttons on bezel */}
              {activeDevice === "tablet" && (
                <>
                  <span className="absolute -right-[3px] top-24 w-[3px] h-14 bg-[#b8b8bc] dark:bg-[#0a0a0a] rounded-r-sm" />
                  <span className="absolute -top-[3px] right-14 w-10 h-[3px] bg-[#b8b8bc] dark:bg-[#0a0a0a] rounded-t-sm" />
                </>
              )}

              {/* Mobile: side buttons on bezel */}
              {activeDevice === "mobile" && (
                <>
                  <span className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#111] rounded-l-sm" />
                  <span className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#111] rounded-l-sm" />
                  <span className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#111] rounded-l-sm" />
                  <span className="absolute -right-[3px] top-32 w-[3px] h-16 bg-[#111] rounded-r-sm" />
                </>
              )}

              <div
                className={`overflow-hidden relative flex flex-col ring-1 ring-black/40
                  ${activeDevice === "desktop" ? "h-[560px]" : ""}
                  ${activeDevice === "tablet"  ? "h-[580px] rounded-[1.75rem]" : ""}
                  ${activeDevice === "mobile"  ? "h-[580px] rounded-[2.5rem]" : ""}
                `}
                style={{
                  background: backgroundType === "gradient" ? backgroundValue : backgroundType === "solid" ? backgroundValue : "#000000",
                }}
              >
              {/* Mobile: dynamic island overlay on the screen itself */}
              {activeDevice === "mobile" && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30 flex items-center justify-end pr-2">
                  <span className="w-2 h-2 rounded-full bg-[#1a1a1a] ring-1 ring-white/10" />
                </div>
              )}

              {/* Mobile: home indicator overlaid on top of the screen content, like a real iPhone */}
              {activeDevice === "mobile" && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/80 z-30 pointer-events-none" />
              )}
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

                  <h2 className="text-lg font-bold dark:text-white mb-1 flex items-center justify-center flex-wrap gap-1">
                    {renderWithAppleEmojis(displayName || "Tu Nombre")}
                  </h2>
                  <div className="text-xs text-[#555555] dark:text-[#a1a1aa] mb-6 leading-relaxed flex items-center justify-center flex-wrap gap-0.5">
                    {renderWithAppleEmojis(bio || "Tu biografía...")}
                  </div>

                  {/* SOCIAL BUBBLES */}
                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-[260px] mx-auto">
                      {socialLinks.map((link) => (
                        <div
                          key={link.id}
                          className="relative w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg border border-black/5 dark:border-white/10 overflow-hidden"
                          style={{
                            background: link.icon === 'instagram' ? 'linear-gradient(45deg, #ffe17d 0%, #fa9137 20%, #eb4141 40%, #c43aee 70%, #4c64d3 100%)'
                              : link.icon === 'tiktok' ? '#000000'
                              : link.icon === 'snapchat' ? '#FFFC00'
                              : link.icon === 'youtube' ? '#FF0000'
                              : link.icon === 'whatsapp' ? '#25D366'
                              : link.icon === 'spotify' ? '#1DB954'
                              : link.icon === 'facebook' ? '#1877F2'
                              : link.icon === 'twitter' ? '#000000'
                              : themeColor,
                            backgroundSize: '120% 120%',
                            backgroundPosition: 'center',
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
                    {mainLinks.length > 0 ? mainLinks.map((link) => {
                      const isSensitive = ["onlyfans.com", "fansly.com", "patreon.com", "justforfans.com"].some(
                        (domain) => link.url?.toLowerCase().includes(domain)
                      );
                      return (
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
                                <span className="font-bold text-white text-[10px] line-clamp-2 leading-tight flex items-center justify-center gap-0.5">
                                  {link.title}
                                  {isSensitive && <PiLock className="w-3 h-3 text-white/75" />}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <PlatformIcon
                                id={link.icon}
                                className={`w-4 h-4 flex-shrink-0 ${isOutline ? "" : "text-white dark:text-black"}`}
                              />
                              <span className={`text-xs font-bold truncate flex-1 text-left flex items-center gap-1 ${isOutline ? "" : "text-white dark:text-black"}`}>
                                {link.title}
                                {isSensitive && <PiLock className={`w-3.5 h-3.5 inline-block ${isOutline ? "" : "text-white/60 dark:text-black/60"}`} />}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    }) : (
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
          </div>
        </main>
      </div>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName={upgradeFeatureName} 
      />

      <AddLinkModal
        isOpen={isAddLinkModalOpen || !!activeEditLink}
        onClose={() => {
          setIsAddLinkModalOpen(false);
          setActiveEditLink(null);
        }}
        onSuccess={fetchLinks}
        editLink={activeEditLink}
      />

      <SecurityScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        profile={{
          id: user.id,
          display_name: displayName,
          bio,
          seo_title: seoTitle,
          seo_description: seoDescription,
        }}
        links={links}
        userPlan={userPlan}
        onFix={async (profileUpdates, linksUpdates) => {
          setDisplayName(profileUpdates.display_name);
          setBio(profileUpdates.bio);
          setSeoTitle(profileUpdates.seo_title);
          setSeoDescription(profileUpdates.seo_description);

          const { error: upsertErr } = await supabase.from("profiles").upsert({
            id:           user.id,
            username,
            display_name: profileUpdates.display_name,
            bio:          profileUpdates.bio,
            avatar_url:   avatarUrl,
            theme_color:  themeColor,
            button_style: buttonStyle,
            font_family:  fontFamily,
            template_id:  templateId,
            background_type: backgroundType,
            background_value: backgroundValue,
            background_blur: backgroundBlur,
            layout_mode:  layoutMode,
            seo_title:    profileUpdates.seo_title,
            seo_description: profileUpdates.seo_description,
            updated_at:   new Date().toISOString(),
          });
          if (upsertErr) throw upsertErr;

          setLinks(linksUpdates);
          
          const linkUpdates = linksUpdates.map((link) => 
            supabase.from("links").update({ title: link.title }).eq("id", link.id)
          );
          await Promise.all(linkUpdates);
          revalidateProfile(username);

          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }}
        onOpenUpgradeModal={handlePremiumFeatureClick}
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
