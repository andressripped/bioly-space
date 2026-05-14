"use client";

import { useEffect, useRef } from "react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { Share2 } from "lucide-react";

// Same mapping as ProfileClient — single source of truth
const BUTTON_STYLE_MAP: Record<string, string> = {
  rounded: "rounded-2xl",
  pill:    "rounded-full",
  square:  "rounded-md",
  outline: "rounded-2xl",
};

const FONT_MAP: Record<string, string> = {
  inter: "font-sans",
  serif: "font-serif",
  mono:  "font-mono",
};

interface ProfileViewProps {
  profile: any;
  links: any[];
}

export default function ProfileView({ profile, links }: ProfileViewProps) {
  const tracked = useRef(false);

  // Resolve style classes from profile data
  const btnClass  = BUTTON_STYLE_MAP[profile.button_style ?? "rounded"] ?? "rounded-2xl";
  const isOutline = (profile.button_style ?? "rounded") === "outline";
  const fontClass = FONT_MAP[profile.font_family ?? "inter"] ?? "font-sans";
  const themeColor = profile.theme_color || "#111111";

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

  return (
    <div className={`min-h-screen flex flex-col items-center bg-[#fcfcfc] dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] selection:bg-black selection:text-white ${fontClass}`}>

      {/* BANNER */}
      <div
        className="w-full h-40 sm:h-52 transition-colors duration-1000"
        style={{ backgroundColor: themeColor }}
      />

      {/* MAIN CONTENT */}
      <main className="w-full max-w-xl px-6 -mt-16 sm:-mt-20 pb-20 flex flex-col items-center">

        {/* Avatar */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-[#fcfcfc] dark:bg-[#050505] shadow-2xl mb-6 relative">
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] dark:text-white">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-base text-[#666666] dark:text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
            {profile.bio || "Bienvenido a mi espacio digital."}
          </p>
        </div>

        {/* LINKS — styled from profile.button_style */}
        <div className="w-full space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link)}
              className={`group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${btnClass} ${
                isOutline
                  ? "bg-transparent border-2 hover:opacity-80"
                  : "bg-[#111111] dark:bg-white border border-transparent hover:opacity-90 shadow-md hover:shadow-lg"
              }`}
              style={isOutline ? { borderColor: themeColor, color: themeColor } : {}}
            >
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
            </a>
          ))}

          {links.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <p className="text-sm italic">Este usuario aún no ha añadido enlaces.</p>
            </div>
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
