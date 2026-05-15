"use client";

import { useEffect, useRef, useState } from "react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { Share2, Mail, Check, Loader2 } from "lucide-react";
import { FONT_CLASSES } from "@/lib/fonts";

// Same mapping as ProfileClient — single source of truth
const BUTTON_STYLE_MAP: Record<string, string> = {
  rounded: "rounded-2xl",
  pill:    "rounded-full",
  square:  "rounded-md",
  outline: "rounded-2xl",
  card:    "rounded-3xl",
};

interface ProfileViewProps {
  profile: any;
  links: any[];
}

export default function ProfileView({ profile, links }: ProfileViewProps) {
  const tracked = useRef(false);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState({ text: "", isError: false });

  // Resolve style classes from profile data
  const btnClass  = BUTTON_STYLE_MAP[profile.button_style ?? "rounded"] ?? "rounded-2xl";
  const isOutline = (profile.button_style ?? "rounded") === "outline";
  const isCard    = profile.button_style === "card";
  const fontClass = FONT_CLASSES[profile.font_family ?? "inter"] || FONT_CLASSES["inter"];
  const themeColor = profile.theme_color || "#111111";
  const bgType = profile.background_type || "solid";
  const bgValue = profile.background_value || "#fcfcfc";
  const layoutMode = profile.layout_mode || "classic";

  // Track page view (once)
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profile.id,
        event_type: "page_view",
        referrer: document.referrer ? new URL(document.referrer).hostname : "direct",
      }),
    }).catch(() => {});
  }, [profile.id]);

  const handleLinkClick = (link: any) => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profile.id,
        link_id: link.id,
        event_type: "link_click",
        referrer: document.referrer ? new URL(document.referrer).hostname : "direct",
      }),
    }).catch(() => {});
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: profile.display_name, text: profile.bio, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profile.id, event_type: "share" }),
    }).catch(() => {});
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setSubscribeMessage({ text: "", isError: false });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profile.id, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al suscribirse");
      setSubscribeMessage({ text: "¡Suscripción exitosa!", isError: false });
      setEmail("");
    } catch (err: any) {
      setSubscribeMessage({ text: err.message, isError: true });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center text-[#111111] dark:text-[#f4f4f5] selection:bg-black selection:text-white relative ${fontClass}`}
      style={{
        background: bgType === "gradient" ? bgValue : bgType === "solid" ? bgValue : "#000000",
      }}
    >
      {/* BANNER / BACKGROUND */}
      {bgType === "solid" && (
        <div
          className="w-full h-40 sm:h-52 transition-colors duration-1000 relative z-10"
          style={{ backgroundColor: themeColor }}
        />
      )}
      {bgType === "gradient" && (
        <div className="w-full h-16 relative z-10" />
      )}
      {bgType === "image_fade" && (
        <div className="fixed top-0 left-0 w-full h-[60vh] z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgValue})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`w-full max-w-xl px-6 ${bgType === "solid" ? "-mt-16 sm:-mt-20" : bgType === "image_fade" ? "pt-24 sm:pt-32" : "mt-8"} pb-20 flex flex-col items-center relative z-10`}>

        {/* Avatar */}
        <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 shadow-2xl mb-6 relative ${bgType === "solid" ? "bg-white dark:bg-[#050505]" : "bg-white/10 backdrop-blur-md border border-white/20"}`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-[#111] border border-black/5 dark:border-white/5">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold opacity-20">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={handleShare}
            title="Compartir"
            className="absolute bottom-2 right-2 p-3 bg-white dark:bg-[#111] rounded-full shadow-xl border border-[#eeeeee] dark:border-[#222] hover:scale-110 active:scale-95 transition-all"
          >
            <Share2 className="w-5 h-5 text-[#111111] dark:text-white" />
          </button>
        </div>

        {/* Name & Bio */}
        <div className="text-center mb-10 space-y-2">
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${bgType === "image_fade" ? "text-white drop-shadow-md" : "text-[#111111] dark:text-white"}`}>
            {profile.display_name || profile.username}
          </h1>
          <p className={`text-base max-w-md mx-auto leading-relaxed ${bgType === "image_fade" ? "text-gray-200" : "text-[#666666] dark:text-[#a1a1aa]"}`}>
            {profile.bio || "Bienvenido a mi espacio digital."}
          </p>
        </div>

        {/* LINKS — styled from profile.button_style */}
        {/* LINKS */}
        <div className={`w-full ${isCard ? "grid grid-cols-2 gap-4" : "space-y-3"}`}>
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link)}
              className={
                isCard
                  ? `group relative aspect-[4/5] w-full overflow-hidden flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${btnClass} shadow-xl border border-white/10`
                  : `group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${btnClass} ${
                      isOutline
                        ? "bg-transparent border-2 hover:opacity-80"
                        : "bg-[#111111] dark:bg-white border border-transparent hover:opacity-90 shadow-md hover:shadow-lg"
                    }`
              }
              style={!isCard && isOutline ? { borderColor: themeColor, color: themeColor } : {}}
            >
              {isCard ? (
                <>
                  <div className="absolute inset-0 bg-gray-800">
                    <img src={link.thumbnail_url || `https://source.unsplash.com/random/400x500?${link.title}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" alt={link.title} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 w-full text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <PlatformIcon id={link.icon} className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm line-clamp-2">
                      {link.title}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${
                    isOutline ? "bg-black/5" : "bg-white/10"
                  }`}>
                    <PlatformIcon
                      id={link.icon}
                      className={`w-5 h-5 ${isOutline ? "" : "text-white dark:text-black"}`}
                    />
                  </div>
                  <span className={`font-bold text-base flex-1 text-left ${isOutline ? "" : "text-white dark:text-black"}`}>
                    {link.title}
                  </span>
                  <svg
                    className={`w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${isOutline ? "" : "text-white dark:text-black"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </a>
          ))}

          {links.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <p className="text-sm italic">Este usuario aún no ha añadido enlaces.</p>
            </div>
          )}
        </div>

        {/* Email Collection / Lead Gen */}
        <div className="w-full mt-10 p-6 bg-white dark:bg-[#111] rounded-3xl border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-black rounded-lg">
              <Mail className="w-5 h-5 text-[#111111] dark:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Suscríbete</h3>
              <p className="text-xs text-[#666666] dark:text-[#a1a1aa]">Recibe mis últimas actualizaciones.</p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#111] dark:focus:border-white transition-colors"
            />
            <button
              type="submit"
              disabled={subscribing}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-w-[100px] ${
                isOutline 
                  ? "border-2 border-[#111] dark:border-white text-[#111] dark:text-white hover:bg-[#111] hover:text-white dark:hover:bg-white dark:hover:text-black" 
                  : "bg-[#111111] dark:bg-white text-white dark:text-black hover:opacity-90"
              }`}
            >
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suscribirme"}
            </button>
          </form>
          {subscribeMessage.text && (
            <p className={`mt-3 text-xs font-medium flex items-center gap-1 ${subscribeMessage.isError ? "text-red-500" : "text-emerald-500"}`}>
              {!subscribeMessage.isError && <Check className="w-3 h-3" />}
              {subscribeMessage.text}
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#111] rounded-full text-[10px] font-bold uppercase tracking-widest text-[#999999] hover:text-[#111111] dark:hover:text-white transition-colors border border-[#eeeeee] dark:border-[#222]"
          >
            <span>Creado con</span>
            <span className="text-[#111111] dark:text-white">Bioly</span>
          </a>
        </footer>
      </main>
    </div>
  );
}
