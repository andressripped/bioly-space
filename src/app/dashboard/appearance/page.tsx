"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { LayoutDashboard, User, Settings, ArrowLeft, Check, Loader2, Save, Palette, Menu, X } from "lucide-react";

// ─── Preset themes ────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Elegancia oscura",
    themeColor: "#111111",
    bgColor: "#0a0a0a",
    buttonColor: "#ffffff",
    textColor: "#ffffff",
    preview: ["#111111", "#222222", "#333333"],
  },
  {
    id: "arctic",
    name: "Arctic",
    description: "Limpio y mínimal",
    themeColor: "#e0f2fe",
    bgColor: "#f8fafc",
    buttonColor: "#0ea5e9",
    textColor: "#0c4a6e",
    preview: ["#e0f2fe", "#bae6fd", "#0ea5e9"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Cálido y vibrante",
    themeColor: "#f97316",
    bgColor: "#fff7ed",
    buttonColor: "#ea580c",
    textColor: "#7c2d12",
    preview: ["#f97316", "#fb923c", "#fdba74"],
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural y sereno",
    themeColor: "#16a34a",
    bgColor: "#f0fdf4",
    buttonColor: "#15803d",
    textColor: "#14532d",
    preview: ["#16a34a", "#22c55e", "#86efac"],
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Misterioso y profundo",
    themeColor: "#7c3aed",
    bgColor: "#faf5ff",
    buttonColor: "#6d28d9",
    textColor: "#3b0764",
    preview: ["#7c3aed", "#8b5cf6", "#a78bfa"],
  },
  {
    id: "rose",
    name: "Rose",
    description: "Suave y romántico",
    themeColor: "#e11d48",
    bgColor: "#fff1f2",
    buttonColor: "#be123c",
    textColor: "#881337",
    preview: ["#e11d48", "#f43f5e", "#fda4af"],
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Profundo y calmado",
    themeColor: "#0284c7",
    bgColor: "#f0f9ff",
    buttonColor: "#0369a1",
    textColor: "#0c4a6e",
    preview: ["#0284c7", "#0ea5e9", "#7dd3fc"],
  },
  {
    id: "custom",
    name: "Personalizado",
    description: "Tu propio color",
    themeColor: "",
    bgColor: "#ffffff",
    buttonColor: "#111111",
    textColor: "#111111",
    preview: [],
  },
];

const BUTTON_STYLES = [
  { id: "rounded", label: "Redondeado", class: "rounded-2xl" },
  { id: "pill", label: "Píldora", class: "rounded-full" },
  { id: "square", label: "Cuadrado", class: "rounded-md" },
  { id: "outline", label: "Outline", class: "rounded-2xl border-2 border-current bg-transparent" },
];

const FONTS = [
  { id: "inter", label: "Inter", style: "font-sans" },
  { id: "serif", label: "Serif", style: "font-serif" },
  { id: "mono", label: "Mono", style: "font-mono" },
];

export default function AppearancePage() {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState("midnight");
  const [customColor, setCustomColor] = useState("#6366f1");
  const [buttonStyle, setButtonStyle] = useState("rounded");
  const [fontFamily, setFontFamily] = useState("inter");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("theme_color, button_style, font_family, display_name, avatar_url, username")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        // Try to match current theme_color to a preset
        const match = THEMES.find((t) => t.themeColor === data.theme_color && t.id !== "custom");
        setSelectedTheme(match ? match.id : "custom");
        if (!match && data.theme_color) setCustomColor(data.theme_color);
        if (data.button_style) setButtonStyle(data.button_style);
        if (data.font_family) setFontFamily(data.font_family);
      }
      setLoading(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTheme = selectedTheme === "custom"
    ? { ...THEMES.find((t) => t.id === "custom")!, themeColor: customColor }
    : THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("profiles").update({
      theme_color: activeTheme.themeColor,
      button_style: buttonStyle,
      font_family: fontFamily,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Links" },
    { href: "/dashboard/profile", icon: User, label: "Perfil" },
    { href: "/dashboard/settings", icon: Settings, label: "Ajustes" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-[#111]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-[#eeeeee] dark:border-[#222] min-h-screen p-6 hidden md:flex flex-col">
        <div className="text-2xl font-extrabold tracking-tighter mb-10">bioly.</div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f9fafb] dark:bg-[#111] rounded-xl font-semibold text-[#111111] dark:text-white border border-[#eeeeee] dark:border-[#333]">
            <Palette className="w-5 h-5" />
            Apariencia
          </div>
        </nav>
      </aside>

      {/* Mobile nav overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0a0a0a] border-r border-[#eeeeee] dark:border-[#222] p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="text-2xl font-extrabold tracking-tighter">bioly.</div>
              <button onClick={() => setIsMobileNavOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 text-[#555555] dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors font-medium text-base">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">

        {/* Settings Panel */}
        <div className="flex-1 p-5 md:p-10 overflow-y-auto">

          {/* Mobile top bar */}
          <div className="flex items-center gap-4 mb-8 md:hidden">
            <button onClick={() => setIsMobileNavOpen(true)} className="p-2.5 border border-[#eeeeee] dark:border-[#222] rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xl font-extrabold tracking-tighter">bioly.</span>
          </div>

          <div className="flex items-center gap-4 mb-10">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-[#111] rounded-full transition-colors md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif">Apariencia</h1>
              <p className="text-[#555555] dark:text-[#a1a1aa] text-sm mt-1">Personaliza el aspecto de tu página pública</p>
            </div>
          </div>

          {/* Theme Picker */}
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-4">Tema</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {THEMES.filter((t) => t.id !== "custom").map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedTheme === theme.id
                      ? "border-[#111111] dark:border-white shadow-lg"
                      : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#444]"
                  }`}
                >
                  {/* Color preview */}
                  <div className="flex gap-1.5 mb-3">
                    {theme.preview.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{theme.name}</p>
                  <p className="text-xs text-[#999999] mt-0.5">{theme.description}</p>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white dark:text-black" />
                    </div>
                  )}
                </button>
              ))}

              {/* Custom color option */}
              <button
                onClick={() => setSelectedTheme("custom")}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedTheme === "custom"
                    ? "border-[#111111] dark:border-white shadow-lg"
                    : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#444]"
                }`}
              >
                <div className="flex gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 via-violet-400 to-blue-400" />
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 via-green-400 to-cyan-400" />
                </div>
                <p className="font-semibold text-sm">Personalizado</p>
                <p className="text-xs text-[#999999] mt-0.5">Tu propio color</p>
                {selectedTheme === "custom" && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white dark:text-black" />
                  </div>
                )}
              </button>
            </div>

            {/* Custom color picker */}
            {selectedTheme === "custom" && (
              <div className="mt-4 flex items-center gap-4 p-4 bg-[#f9fafb] dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222]">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border-none p-1 cursor-pointer bg-transparent"
                />
                <div>
                  <p className="font-semibold text-sm">Color personalizado</p>
                  <p className="text-xs text-[#999999] font-mono">{customColor.toUpperCase()}</p>
                </div>
              </div>
            )}
          </section>

          {/* Button style */}
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-4">Estilo de botones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BUTTON_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setButtonStyle(style.id)}
                  className={`relative p-4 border-2 transition-all ${style.class} ${
                    buttonStyle === style.id
                      ? "border-[#111111] dark:border-white bg-[#111111] dark:bg-white text-white dark:text-black"
                      : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#444]"
                  }`}
                >
                  <span className="text-sm font-semibold">{style.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font */}
          <section className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-4">Tipografía</h2>
            <div className="grid grid-cols-3 gap-3">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setFontFamily(font.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    fontFamily === font.id
                      ? "border-[#111111] dark:border-white"
                      : "border-[#eeeeee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#444]"
                  }`}
                >
                  <p className={`text-xl font-bold ${font.style}`}>Aa</p>
                  <p className="text-xs text-[#999999] mt-1">{font.label}</p>
                  {fontFamily === font.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white dark:text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl shadow-black/10"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar apariencia"}
          </button>
        </div>

        {/* Live Preview */}
        <div className="hidden lg:flex w-[380px] border-l border-[#eeeeee] dark:border-[#222] bg-[#f5f5f7] dark:bg-[#000] flex-col items-center justify-center p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-6">Vista previa</p>
          <div
            className="w-[280px] h-[560px] rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-[#111]"
            style={{ backgroundColor: activeTheme.bgColor }}
          >
            {/* Banner */}
            <div className="w-full h-24 transition-colors duration-500" style={{ backgroundColor: activeTheme.themeColor }} />

            {/* Content */}
            <div className="px-5 -mt-8 text-center pb-8">
              <div className="w-16 h-16 mx-auto rounded-full border-4 border-white overflow-hidden bg-[#eeeeee] mb-3">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#999]">
                    {profile?.display_name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <p
                className="font-bold text-base mb-1"
                style={{ color: activeTheme.textColor }}
              >
                {profile?.display_name || "Tu Nombre"}
              </p>
              <p className="text-xs text-[#999999] mb-4">bioly.space/{profile?.username || "usuario"}</p>

              {/* Fake link buttons */}
              <div className="space-y-2.5">
                {["Instagram", "YouTube", "TikTok"].map((name) => {
                  const bStyle = BUTTON_STYLES.find((b) => b.id === buttonStyle);
                  const isOutline = buttonStyle === "outline";
                  return (
                    <div
                      key={name}
                      className={`w-full py-3 px-4 text-xs font-bold text-center ${bStyle?.class}`}
                      style={{
                        backgroundColor: isOutline ? "transparent" : activeTheme.buttonColor,
                        color: isOutline ? activeTheme.buttonColor : (activeTheme.themeColor === "#e0f2fe" || activeTheme.bgColor === "#fff7ed" || activeTheme.bgColor === "#f0fdf4" ? activeTheme.textColor : "#fff"),
                        border: isOutline ? `2px solid ${activeTheme.buttonColor}` : "none",
                      }}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
