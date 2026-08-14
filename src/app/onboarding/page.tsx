"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PiArrowRight, PiArrowLeft, PiCheck, PiSpinner, PiCamera, PiSkipForward } from "react-icons/pi";
import {
  SiInstagram, SiYoutube, SiTiktok, SiX, SiFacebook,
  SiSpotify, SiTwitch, SiDiscord, SiWhatsapp,
  SiTelegram, SiGithub,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { BIOLY_TEMPLATES, TemplateConfig } from "@/lib/templates";

// Reserved usernames that cannot be used
const RESERVED = ["admin", "dashboard", "api", "login", "signup", "settings", "about", "help", "support", "blog", "pricing", "onboarding", "auth", "bioly"];

const QUICK_PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: SiInstagram, prefix: "instagram.com/", color: "#E4405F" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, prefix: "youtube.com/@", color: "#FF0000" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, prefix: "tiktok.com/@", color: "#000000" },
  { id: "twitter", name: "X / Twitter", icon: SiX, prefix: "x.com/", color: "#000000" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, prefix: "facebook.com/", color: "#1877F2" },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, prefix: "linkedin.com/in/", color: "#0A66C2" },
  { id: "spotify", name: "Spotify", icon: SiSpotify, prefix: "open.spotify.com/user/", color: "#1DB954" },
  { id: "twitch", name: "Twitch", icon: SiTwitch, prefix: "twitch.tv/", color: "#9146FF" },
  { id: "discord", name: "Discord", icon: SiDiscord, prefix: "discord.gg/", color: "#5865F2" },
  { id: "whatsapp", name: "WhatsApp", icon: SiWhatsapp, prefix: "wa.me/", color: "#25D366" },
  { id: "telegram", name: "Telegram", icon: SiTelegram, prefix: "t.me/", color: "#26A5E4" },
  { id: "github", name: "GitHub", icon: SiGithub, prefix: "github.com/", color: "#181717" },
];

// Templates offered during onboarding — free tier only
const ONBOARDING_TEMPLATES = BIOLY_TEMPLATES.filter((t) => t.tier === "free");
const DEFAULT_TEMPLATE = ONBOARDING_TEMPLATES.find((t) => t.id === "default")!;

function templatePreviewStyle(t: TemplateConfig): React.CSSProperties {
  if (t.background_type === "gradient") return { background: t.background_value };
  if (t.background_type === "image_fade") return { backgroundImage: `url(${t.background_value})`, backgroundSize: "cover", backgroundPosition: "center" };
  return { backgroundColor: t.background_value };
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Step 1
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "reserved">("idle");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 2
  const [selectedPlatform, setSelectedPlatform] = useState(QUICK_PLATFORMS[0]);
  const [handle, setHandle] = useState("");
  const [addedLinks, setAddedLinks] = useState<{ platform: typeof QUICK_PLATFORMS[0]; handle: string; url: string }[]>([]);

  // Step 3
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(DEFAULT_TEMPLATE);

  const TOTAL_STEPS = 3;

  // Load user and pre-fill from localStorage
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const pending = localStorage.getItem("pending_username");
      if (pending) {
        setUsername(pending.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
      }
      // Pre-fill name from Google profile
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setDisplayName(googleName);
      // Pre-fill avatar from Google
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
      if (googleAvatar) setAvatarUrl(googleAvatar);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Username validation with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    if (RESERVED.includes(username)) {
      setUsernameStatus("reserved");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(timer);
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const addLink = () => {
    if (!handle.trim()) return;
    const url = `https://${selectedPlatform.prefix}${handle.trim()}`;
    setAddedLinks(prev => [...prev, { platform: selectedPlatform, handle, url }]);
    setHandle("");
  };

  const removeLink = (index: number) => {
    setAddedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const canProceedStep1 = username.length >= 3 && usernameStatus === "available" && displayName.trim().length > 0;

  const saveProfileAndLinks = async (template: TemplateConfig) => {
    if (!user) return;
    setLoading(true);
    try {
      // Upload avatar if changed
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${user.id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, avatarFile);
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
          finalAvatarUrl = publicUrl;
        }
      }

      // Create / upsert profile
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        display_name: displayName,
        avatar_url: finalAvatarUrl,
        template_id: template.id,
        theme_color: template.theme_color,
        button_style: template.button_style,
        font_family: template.font_family,
        background_type: template.background_type,
        background_value: template.background_value,
        background_blur: template.background_blur,
        layout_mode: template.layout_mode || "classic",
        onboarding_completed: true,
        plan: "free",
        updated_at: new Date().toISOString(),
      });
      if (profileErr) throw profileErr;

      // Insert links
      if (addedLinks.length > 0) {
        const linksToInsert = addedLinks.map((l, i) => ({
          user_id: user.id,
          title: l.platform.name,
          url: l.url,
          icon: l.platform.id,
          is_active: true,
          position: i,
        }));
        await supabase.from("links").insert(linksToInsert);
      }

      // Clean localStorage
      localStorage.removeItem("pending_username");

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setLoading(false);
    }
  };

  const handleFinish = () => saveProfileAndLinks(selectedTemplate);

  // "Omitir y establecer la configuración predeterminada" — only requires a valid username
  const handleSkipAll = () => {
    if (!canProceedStep1) return;
    saveProfileAndLinks(DEFAULT_TEMPLATE);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] font-sans flex flex-col items-center px-4 py-8 sm:p-6 sm:justify-center transition-colors duration-300">
      {/* Logo */}
      <div className="text-2xl sm:text-3xl font-extrabold tracking-tighter mb-6 sm:mb-10">bioly.</div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
              s < step ? "bg-[#111111] dark:bg-white text-white dark:text-black" :
              s === step ? "bg-[#111111] dark:bg-white text-white dark:text-black ring-4 ring-[#111111]/20 dark:ring-white/20" :
              "bg-[#f0f0f0] dark:bg-[#222] text-[#999]"
            }`}>
              {s < step ? <PiCheck className="w-4 h-4" /> : s}
            </div>
            {s < TOTAL_STEPS && <div className={`w-8 sm:w-16 h-0.5 transition-all ${s < step ? "bg-[#111111] dark:bg-white" : "bg-[#eeeeee] dark:bg-[#333]"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full sm:max-w-lg">
        {/* STEP 1 — Identity */}
        {step === 1 && (
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[1.75rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">Reclama tu espacio</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm text-center mb-6 sm:mb-8">Elige cómo te verá el mundo</p>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#eeeeee] dark:bg-[#222] border-2 border-[#eeeeee] dark:border-[#333]">
                  {(avatarPreview || avatarUrl) ? (
                    <img src={avatarPreview || avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#999]">
                      {displayName.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PiCamera className="w-6 h-6 text-white" />
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
              <p className="text-xs text-[#999] mt-2">Toca para cambiar</p>
            </div>

            <div className="space-y-5">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-2">Tu nombre</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nombre Apellido"
                  className="w-full bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#333] rounded-2xl py-4 px-5 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium text-base"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-2">Tu username</label>
                <div className={`flex items-center bg-white dark:bg-[#111] border rounded-2xl pl-4 sm:pl-5 pr-4 transition-all ${
                  usernameStatus === "available" ? "border-emerald-400 dark:border-emerald-500" :
                  usernameStatus === "taken" || usernameStatus === "reserved" ? "border-red-400" :
                  "border-[#eeeeee] dark:border-[#333] focus-within:border-[#111111] dark:focus-within:border-white"
                }`}>
                  <span className="text-sm font-bold text-[#999] flex-shrink-0 select-none">bioly.space/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="usuario"
                    className="min-w-0 flex-1 bg-transparent py-4 pl-0.5 pr-2 text-[#111111] dark:text-white focus:outline-none font-bold text-sm"
                  />
                  <div className="flex-shrink-0">
                    {usernameStatus === "checking" && <PiSpinner className="w-4 h-4 animate-spin text-[#999]" />}
                    {usernameStatus === "available" && <PiCheck className="w-4 h-4 text-emerald-500" />}
                    {(usernameStatus === "taken" || usernameStatus === "reserved") && (
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                {usernameStatus === "available" && <p className="mt-1.5 text-xs text-emerald-500 font-medium ml-1">✓ Disponible</p>}
                {usernameStatus === "taken" && <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">Este username ya está en uso</p>}
                {usernameStatus === "reserved" && <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">Este username está reservado</p>}
                {username.length > 0 && username.length < 3 && <p className="mt-1.5 text-xs text-[#999] font-medium ml-1">Mínimo 3 caracteres</p>}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full mt-8 bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Siguiente <PiArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2 — First Links */}
        {step === 2 && (
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[1.75rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">Añade tus links</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm text-center mb-6 sm:mb-8">Puedes saltarte esto y hacerlo después</p>

            {/* Platform selector */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
              {QUICK_PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPlatform(p); setHandle(""); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedPlatform.id === p.id
                      ? "bg-[#111111] border-[#111111] text-white dark:bg-white dark:border-white dark:text-black"
                      : "bg-white dark:bg-[#111] border-[#eeeeee] dark:border-[#222] text-[#555] hover:border-[#111] dark:hover:border-white"
                  }`}
                >
                  <p.icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>

            {/* Handle input */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#999]">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder={`Tu usuario en ${selectedPlatform.name}`}
                  className="w-full bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#333] rounded-2xl py-3.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#111] dark:focus:border-white transition-all font-medium"
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                />
              </div>
              <button
                onClick={addLink}
                disabled={!handle.trim()}
                className="bg-[#111111] dark:bg-white text-white dark:text-black px-5 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer flex-shrink-0"
              >
                Añadir
              </button>
            </div>

            {/* Added links */}
            {addedLinks.length > 0 && (
              <div className="space-y-2 mb-4">
                {addedLinks.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl p-3">
                    <l.platform.icon className="w-5 h-5 flex-shrink-0" style={{ color: l.platform.color }} />
                    <span className="flex-1 text-sm font-medium truncate">{l.url}</span>
                    <button onClick={() => removeLink(i)} className="text-[#999] hover:text-red-500 transition-colors p-1 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#eeeeee] dark:border-[#333] py-4 rounded-2xl font-semibold text-[#555] hover:border-[#111] dark:hover:border-white transition-colors cursor-pointer flex items-center justify-center gap-2">
                <PiArrowLeft className="w-4 h-4" /> Atrás
              </button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
                {addedLinks.length === 0 ? "Saltar por ahora" : "Siguiente"} <PiArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSkipAll}
              disabled={loading}
              className="w-full mt-3 py-3 rounded-2xl font-semibold text-sm text-[#999] hover:text-[#111111] dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <PiSpinner className="w-4 h-4 animate-spin" /> : <PiSkipForward className="w-4 h-4" />}
              Omitir y usar la configuración predeterminada
            </button>
          </div>
        )}

        {/* STEP 3 — Appearance */}
        {step === 3 && (
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[1.75rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">Elige tu estilo</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm text-center mb-6 sm:mb-8">Podrás cambiarlo cuando quieras desde tu panel</p>

            {/* Template gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {ONBOARDING_TEMPLATES.map((t) => {
                const isSelected = selectedTemplate.id === t.id;
                const isLight = t.background_type === "solid" && ["#fcfcfc", "#fafafa", "#fdf4ff", "#e0f2fe"].includes(t.background_value);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-[3/4] flex flex-col items-center justify-center gap-2 ${
                      isSelected ? "border-[#111111] dark:border-white ring-2 ring-[#111111]/20 dark:ring-white/20 scale-[1.02]" : "border-transparent hover:scale-[1.02]"
                    }`}
                    style={templatePreviewStyle(t)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center">
                        <PiCheck className="w-3 h-3 text-white dark:text-black" />
                      </div>
                    )}
                    <div
                      className="w-8 h-8 rounded-full border-2"
                      style={{ backgroundColor: t.theme_color, borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.4)" }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                      style={{
                        color: isLight || t.background_type === "image_fade" ? "#fff" : "#111",
                        backgroundColor: isLight || t.background_type === "image_fade" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-[#eeeeee] dark:border-[#333] py-4 rounded-2xl font-semibold text-[#555] hover:border-[#111] dark:hover:border-white transition-colors cursor-pointer flex items-center justify-center gap-2">
                <PiArrowLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-[2] bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {loading ? <PiSpinner className="w-5 h-5 animate-spin" /> : <PiCheck className="w-5 h-5" />}
                {loading ? "Publicando..." : "¡Publicar mi Bioly!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
