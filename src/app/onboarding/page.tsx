"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Check, Loader2, Camera } from "lucide-react";
import {
  SiInstagram, SiYoutube, SiTiktok, SiX, SiFacebook,
  SiSpotify, SiTwitch, SiDiscord, SiWhatsapp,
  SiTelegram, SiGithub,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

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
  const [themeColor, setThemeColor] = useState("#111111");

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

  const handleFinish = async () => {
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
        theme_color: themeColor,
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

  const canProceedStep1 = username.length >= 3 && usernameStatus === "available" && displayName.trim().length > 0;
  const canProceedStep2 = true; // links are optional

  const THEME_COLORS = ["#111111", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#0ea5e9"];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] font-sans flex flex-col items-center justify-center p-6 transition-colors duration-300">
      {/* Logo */}
      <div className="text-3xl font-extrabold tracking-tighter mb-10">bioly.</div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s < step ? "bg-[#111111] dark:bg-white text-white dark:text-black" :
              s === step ? "bg-[#111111] dark:bg-white text-white dark:text-black ring-4 ring-[#111111]/20 dark:ring-white/20" :
              "bg-[#f0f0f0] dark:bg-[#222] text-[#999]"
            }`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`w-16 h-0.5 transition-all ${s < step ? "bg-[#111111] dark:bg-white" : "bg-[#eeeeee] dark:bg-[#333]"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        {/* STEP 1 — Identity */}
        {step === 1 && (
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] p-10 shadow-sm">
            <h1 className="text-3xl font-serif mb-2 text-center">Tu identidad digital</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm text-center mb-8">Elige cómo te verá el mundo</p>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
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
                  <Camera className="w-6 h-6 text-white" />
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
                  className="w-full bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#333] rounded-2xl py-4 px-5 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-2">Tu username</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#999]">bioly.space/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="tususername"
                    className={`w-full bg-white dark:bg-[#111] border rounded-2xl py-4 pl-[110px] pr-12 text-[#111111] dark:text-white focus:outline-none transition-all font-bold ${
                      usernameStatus === "available" ? "border-emerald-400 dark:border-emerald-500" :
                      usernameStatus === "taken" || usernameStatus === "reserved" ? "border-red-400" :
                      "border-[#eeeeee] dark:border-[#333] focus:border-[#111111] dark:focus:border-white"
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && <Loader2 className="w-4 h-4 animate-spin text-[#999]" />}
                    {usernameStatus === "available" && <Check className="w-4 h-4 text-emerald-500" />}
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
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full mt-8 bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2 — First Links */}
        {step === 2 && (
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] p-10 shadow-sm">
            <h1 className="text-3xl font-serif mb-2 text-center">Añade tus links</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm text-center mb-8">Puedes saltarte esto y hacerlo después</p>

            {/* Platform selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {QUICK_PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPlatform(p); setHandle(""); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
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
                className="bg-[#111111] dark:bg-white text-white dark:text-black px-5 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-30"
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
                    <button onClick={() => removeLink(i)} className="text-[#999] hover:text-red-500 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#eeeeee] dark:border-[#333] py-4 rounded-2xl font-semibold text-[#555] hover:border-[#111] dark:hover:border-white transition-colors">
                Atrás
              </button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                {addedLinks.length === 0 ? "Saltar por ahora" : "Siguiente"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Appearance */}
        {step === 3 && (
          <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] p-10 shadow-sm">
            <h1 className="text-3xl font-serif mb-2 text-center">Tu apariencia</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm text-center mb-8">Elige el color de tu espacio digital</p>

            {/* Mini preview */}
            <div className="rounded-3xl overflow-hidden border border-[#eeeeee] dark:border-[#222] mb-8 bg-white dark:bg-[#0a0a0a]">
              <div className="h-20 transition-colors duration-300" style={{ backgroundColor: themeColor }} />
              <div className="p-5 text-center -mt-8">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-white dark:border-[#0a0a0a] overflow-hidden bg-[#eeeeee] mb-3">
                  {(avatarPreview || avatarUrl) ? (
                    <img src={avatarPreview || avatarUrl!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#999]">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="font-serif text-lg font-bold">{displayName}</p>
                <p className="text-xs text-[#999] mt-1">bioly.space/{username}</p>
                {addedLinks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {addedLinks.slice(0, 2).map((l, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl text-left">
                        <l.platform.icon className="w-4 h-4" style={{ color: l.platform.color }} />
                        <span className="text-xs font-semibold">{l.platform.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-3">Color del tema</label>
              <div className="flex items-center gap-3 flex-wrap">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setThemeColor(c)}
                    className={`w-9 h-9 rounded-full transition-all ${themeColor === c ? "ring-2 ring-offset-2 ring-[#111] dark:ring-white scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-9 h-9 rounded-full border-none p-0 overflow-hidden cursor-pointer bg-transparent"
                  title="Color personalizado"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex-1 border border-[#eeeeee] dark:border-[#333] py-4 rounded-2xl font-semibold text-[#555] hover:border-[#111] dark:hover:border-white transition-colors">
                Atrás
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-[2] bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {loading ? "Publicando..." : "¡Publicar mi Bioly!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
