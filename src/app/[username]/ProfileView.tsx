"use client";

import { useEffect, useRef, useState } from "react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { PiShareNetwork, PiEnvelope, PiCheck, PiSpinner, PiEyeSlash, PiLockKey } from "react-icons/pi";
import { FONT_CLASSES } from "@/lib/fonts";
import { renderWithAppleEmojis } from "@/utils/emoji";

const UNLOCK_EMAIL_STORAGE_KEY = "bioly_unlock_email";

// Helper function to safely extract hostname from document.referrer without crashing on non-standard custom URLs (e.g., android-app://...)
const getSafeReferrer = () => {
  if (typeof window === "undefined" || !document.referrer) return "direct";
  try {
    return new URL(document.referrer).hostname || "direct";
  } catch (e) {
    return document.referrer || "direct";
  }
};

const ADULT_DOMAINS = ["onlyfans.com", "fansly.com", "patreon.com", "justforfans.com"];

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
  const [activeSensitiveLink, setActiveSensitiveLink] = useState<any | null>(null);

  // ── Paid / private links ──
  const [unlockedLinkIds, setUnlockedLinkIds] = useState<Set<string>>(new Set());
  const [paywallLink, setPaywallLink] = useState<any | null>(null);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [unlockTelegram, setUnlockTelegram] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  // Resolve style classes from profile data
  const btnClass  = BUTTON_STYLE_MAP[profile.button_style ?? "rounded"] ?? "rounded-2xl";
  const isOutline = (profile.button_style ?? "rounded") === "outline";
  const isCard    = profile.button_style === "card";
  const fontClass = FONT_CLASSES[profile.font_family ?? "inter"] || FONT_CLASSES["inter"];
  const themeColor = profile.theme_color || "#111111";
  const bgType = profile.background_type || "solid";
  const bgValue = profile.background_value || "#fcfcfc";
  const layoutMode = profile.layout_mode || "classic";

  const socialLinks = links.filter(l => l.is_social);
  const mainLinks = links.filter(l => !l.is_social);

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
        referrer: getSafeReferrer(),
      }),
    }).catch(() => {});
  }, [profile.id]);

  // Check which paid links the returning visitor already unlocked (by remembered email)
  useEffect(() => {
    const paidLinks = links.filter((l) => l.is_paid);
    if (paidLinks.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const justUnlockedId = params.get("unlock_link");

    const storedEmail = localStorage.getItem(UNLOCK_EMAIL_STORAGE_KEY);
    if (!storedEmail) return;

    (async () => {
      const results = await Promise.all(
        paidLinks.map(async (l) => {
          try {
            const res = await fetch("/api/links/check-access", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ link_id: l.id, email: storedEmail }),
            });
            const data = await res.json();
            return data.unlocked ? l.id : null;
          } catch {
            return null;
          }
        })
      );
      setUnlockedLinkIds(new Set(results.filter(Boolean) as string[]));

      if (justUnlockedId) {
        params.delete("unlock_link");
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    })();
  }, [links]);

  const openPaywall = (link: any) => {
    setUnlockError("");
    setUnlockEmail(localStorage.getItem(UNLOCK_EMAIL_STORAGE_KEY) || "");
    setUnlockTelegram("");
    setPaywallLink(link);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paywallLink) return;
    setUnlockLoading(true);
    setUnlockError("");
    try {
      const normalizedEmail = unlockEmail.toLowerCase().trim();

      const checkRes = await fetch("/api/links/check-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_id: paywallLink.id, email: normalizedEmail }),
      });
      const checkData = await checkRes.json();

      if (checkData.unlocked) {
        localStorage.setItem(UNLOCK_EMAIL_STORAGE_KEY, normalizedEmail);
        setUnlockedLinkIds((prev) => new Set(prev).add(paywallLink.id));
        setPaywallLink(null);
        return;
      }

      localStorage.setItem(UNLOCK_EMAIL_STORAGE_KEY, normalizedEmail);
      const checkoutRes = await fetch("/api/lemonsqueezy/link-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link_id: paywallLink.id,
          email: normalizedEmail,
          telegram_username: unlockTelegram,
          redirect_path: window.location.pathname,
        }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || "No se pudo iniciar el pago");
      }
      window.location.href = checkoutData.url;
    } catch (err: any) {
      setUnlockError(err.message || "Ocurrió un error, intenta de nuevo");
      setUnlockLoading(false);
    }
  };

  const handleLinkClick = (link: any) => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profile.id,
        link_id: link.id,
        event_type: "link_click",
        referrer: getSafeReferrer(),
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
      className={`min-h-screen flex flex-col items-center text-[#111111] selection:bg-black selection:text-white relative ${fontClass}`}
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
        <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 shadow-2xl mb-6 relative ${bgType === "solid" ? "bg-white" : "bg-white/10 backdrop-blur-md border border-white/20"}`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border border-black/5">
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
            className="absolute bottom-2 right-2 p-3 bg-white rounded-full shadow-xl border border-[#eeeeee] hover:scale-110 active:scale-95 transition-all"
          >
            <PiShareNetwork className="w-5 h-5 text-[#111111]" />
          </button>
        </div>

        {/* Name & Bio */}
        <div className="text-center mb-10 space-y-2">
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight flex items-center justify-center flex-wrap gap-1 ${bgType === "image_fade" ? "text-white drop-shadow-md" : "text-[#111111]"}`}>
            {renderWithAppleEmojis(profile.display_name || profile.username)}
          </h1>
          <div className={`text-base max-w-md mx-auto leading-relaxed flex items-center justify-center flex-wrap gap-0.5 ${bgType === "image_fade" ? "text-gray-200" : "text-[#666666]"}`}>
            {renderWithAppleEmojis(profile.bio || "Bienvenido a mi espacio digital.")}
          </div>
        </div>

        {/* SOCIAL BUBBLES */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {socialLinks.map((link) => {
              const isSensitive = ADULT_DOMAINS.some(domain => link.url?.toLowerCase().includes(domain));
              return (
                <a
                  key={link.id}
                  href={isSensitive ? "#" : link.url}
                  target={isSensitive ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isSensitive) {
                      e.preventDefault();
                      setActiveSensitiveLink(link);
                    } else {
                      handleLinkClick(link);
                    }
                  }}
                  className="relative w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg border border-black/5 overflow-hidden"
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
                <PlatformIcon id={link.icon} className="w-6 h-6" />
              </a>
            );
          })}
          </div>
        )}

        {/* MAIN LINKS */}
        <div className={`w-full ${isCard ? "grid grid-cols-2 sm:grid-cols-2 gap-4" : "space-y-3"}`}>
          {mainLinks.map((link) => {
            const isSensitive = ADULT_DOMAINS.some(domain => link.url?.toLowerCase().includes(domain));
            const isLocked = link.is_paid && !unlockedLinkIds.has(link.id);

            if (isLocked) {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => openPaywall(link)}
                  className={
                    isCard
                      ? `group relative aspect-[4/5] w-full overflow-hidden flex flex-col items-center justify-center gap-2 p-4 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${btnClass} border-2 border-dashed border-black/10 bg-black/[0.02]`
                      : `w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${btnClass} border-2 border-dashed border-black/10 bg-black/[0.02]`
                  }
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 bg-black/5">
                    <PiLockKey className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-base ${isCard ? "" : "flex-1 text-left"}`}>{link.title}</span>
                  <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-black/5 flex-shrink-0">
                    ${Number(link.price_usd).toFixed(2)} USD/mes
                  </span>
                </button>
              );
            }

            return (
              <a
                key={link.id}
                href={isSensitive ? "#" : link.url}
                target={isSensitive ? undefined : "_blank"}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (isSensitive) {
                    e.preventDefault();
                    setActiveSensitiveLink(link);
                  } else {
                    handleLinkClick(link);
                  }
                }}
                className={
                  isCard
                    ? `group relative aspect-[4/5] w-full overflow-hidden flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${btnClass} shadow-xl border border-white/10`
                    : `group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${btnClass} ${
                        isOutline
                          ? "bg-transparent border-2 hover:opacity-80"
                          : "bg-[#111111] border border-transparent hover:opacity-90 shadow-md hover:shadow-lg"
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
                      className={`w-5 h-5 ${isOutline ? "" : "text-white"}`}
                    />
                  </div>
                  <span className={`font-bold text-base flex-1 text-left ${isOutline ? "" : "text-white"}`}>
                    {link.title}
                  </span>
                  <svg
                    className={`w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${isOutline ? "" : "text-white"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </a>
          );
        })}

          {mainLinks.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <p className="text-sm italic">Este usuario aún no ha añadido enlaces.</p>
            </div>
          )}
        </div>

        {/* Email Collection / Lead Gen */}
        <div className="w-full mt-10 p-6 bg-white rounded-3xl border border-[#eeeeee] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PiEnvelope className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Suscríbete</h3>
              <p className="text-xs text-[#666666]">Recibe mis últimas actualizaciones.</p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:flex-1 bg-[#f9fafb] border border-[#eeeeee] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#111] transition-colors"
            />
            <button
              type="submit"
              disabled={subscribing}
              className={`w-full sm:w-auto px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-w-[100px] ${
                isOutline 
                  ? "border-2 border-[#111] text-[#111] hover:bg-[#111] hover:text-white" 
                  : "bg-[#111111] text-white hover:opacity-90"
              }`}
            >
              {subscribing ? <PiSpinner className="w-4 h-4 animate-spin" /> : "Suscribirme"}
            </button>
          </form>
          {subscribeMessage.text && (
            <p className={`mt-3 text-xs font-medium flex items-center gap-1 ${subscribeMessage.isError ? "text-red-500" : "text-emerald-500"}`}>
              {!subscribeMessage.isError && <PiCheck className="w-3 h-3" />}
              {subscribeMessage.text}
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#999999] hover:text-[#111111] transition-colors border border-[#eeeeee]"
          >
            <span>Creado con</span>
            <span className="text-[#111111]">Bioly</span>
          </a>
        </footer>
      </main>

      {/* ── +18 CONTENT WARNING OVERLAY ── */}
      {activeSensitiveLink && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex flex-col items-center text-center max-w-sm space-y-6">
            
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md">
              <PiEyeSlash className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                18+ Content Warning
              </h2>
              <p className="text-sm text-gray-300/90 leading-relaxed font-medium">
                This link may contain graphic or adult content.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full pt-4">
              <button
                onClick={() => {
                  handleLinkClick(activeSensitiveLink);
                  const urlBase64 = typeof window !== "undefined" ? btoa(activeSensitiveLink.url) : Buffer.from(activeSensitiveLink.url).toString('base64');
                  window.open(atob(urlBase64), "_blank");
                  setActiveSensitiveLink(null);
                }}
                className="w-full bg-white text-black py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg text-sm"
              >
                Continue
              </button>
              <button
                onClick={() => setActiveSensitiveLink(null)}
                className="w-full py-3.5 rounded-full font-semibold text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── PAYWALL: unlock a private link ── */}
      {paywallLink && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-5 bg-black/5 rounded-full flex items-center justify-center">
              <PiLockKey className="w-6 h-6 text-[#111111]" />
            </div>

            <h2 className="text-lg font-bold text-[#111111] text-center mb-1">{paywallLink.title}</h2>
            <p className="text-sm text-[#666666] text-center mb-6">
              Suscripción mensual de <span className="font-bold text-[#111111]">${Number(paywallLink.price_usd).toFixed(2)} USD/mes</span> — se renueva automáticamente, cancela cuando quieras.
            </p>

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={unlockEmail}
                onChange={(e) => setUnlockEmail(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#eeeeee] rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
              />
              <div>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre en Telegram"
                  value={unlockTelegram}
                  onChange={(e) => setUnlockTelegram(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#eeeeee] rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
                />
                <p className="mt-1.5 text-[10px] text-[#999999] leading-relaxed">
                  Lo usamos para aceptar tu solicitud al grupo — pon el nombre con el que apareces en Telegram.
                </p>
              </div>
              {unlockError && <p className="text-xs text-red-500 font-medium">{unlockError}</p>}
              <button
                type="submit"
                disabled={unlockLoading}
                className="w-full bg-[#111111] text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unlockLoading ? <PiSpinner className="w-4 h-4 animate-spin" /> : null}
                {unlockLoading ? "Verificando..." : `Suscribirme por $${Number(paywallLink.price_usd).toFixed(2)} USD/mes`}
              </button>
              <button
                type="button"
                onClick={() => setPaywallLink(null)}
                className="w-full py-2.5 text-xs font-semibold text-[#999999] hover:text-[#111111] transition-colors"
              >
                Cancelar
              </button>
            </form>

            <p className="mt-4 text-[10px] text-[#999999] text-center leading-relaxed">
              Si ya tienes una suscripción activa con este email, se desbloqueará al instante.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
