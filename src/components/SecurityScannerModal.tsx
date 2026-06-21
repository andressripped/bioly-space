"use client";

import { useState, useEffect } from "react";
import { 
  PiX, 
  PiShieldCheck, 
  PiWarning, 
  PiCheckCircle, 
  PiArrowLeft, 
  PiArrowRight, 
  PiSpinner, 
  PiLock, 
  PiCaretRight, 
  PiWarningCircle,
  PiLink,
  PiUser,
  PiGlobe,
  PiNotebook
} from "react-icons/pi";

interface SecurityScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    display_name: string;
    bio: string;
    seo_title: string;
    seo_description: string;
  };
  links: any[];
  userPlan: string;
  onFix: (profileUpdates: any, linksUpdates: any[]) => Promise<void>;
  onOpenUpgradeModal: (featureName: string) => void;
}

const HIGH_RISK_WORDS = ["onlyfans", "fansly", "sex", "nudes", "porn", "naked", "xxx", "biografia hot"];
const MEDIUM_RISK_WORDS = ["+18", "18+", "exclusivo", "privado", "of"];
const ADULT_DOMAINS = ["onlyfans.com", "fansly.com", "patreon.com", "justforfans.com", "manyvids.com", "cams.com", "stripchat.com"];

export default function SecurityScannerModal({
  isOpen,
  onClose,
  profile,
  links,
  userPlan,
  onFix,
  onOpenUpgradeModal,
}: SecurityScannerModalProps) {
  const [view, setView] = useState<"main" | "detail">("main");
  const [selectedCategory, setSelectedCategory] = useState<"links" | "profile" | "link_titles" | "seo">("links");
  const [saving, setSaving] = useState(false);

  // Local editable drafts
  const [draftProfile, setDraftProfile] = useState({
    display_name: "",
    bio: "",
    seo_title: "",
    seo_description: "",
  });
  const [draftLinks, setDraftLinks] = useState<any[]>([]);

  // Initialize drafts when modal opens or parent data updates
  useEffect(() => {
    if (isOpen) {
      setDraftProfile({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        seo_title: profile.seo_title || "",
        seo_description: profile.seo_description || "",
      });
      setDraftLinks(links.map(l => ({ ...l })));
      setView("main");
    }
  }, [isOpen, profile, links]);

  // Helper to detect risk words
  const detectWords = (text: string) => {
    if (!text) return [];
    const found: string[] = [];
    const lowerText = text.toLowerCase();
    
    HIGH_RISK_WORDS.forEach(word => {
      if (lowerText.includes(word)) {
        found.push(word);
      }
    });

    MEDIUM_RISK_WORDS.forEach(word => {
      const isMatch = word === "of" 
        ? new RegExp(`\\b${word}\\b`, "i").test(text)
        : lowerText.includes(word);

      if (isMatch) {
        found.push(word);
      }
    });

    return Array.from(new Set(found));
  };

  // Get status of categories dynamically based on drafts
  const getCategoriesStatus = () => {
    // 1. Links expuestos:
    // They are safe if enmasked by Bioly's base64, so it is always "safe" or "protected".
    // We search if there are adult links.
    const adultLinks = draftLinks.filter(link => {
      if (!link.url) return false;
      const lowerUrl = link.url.toLowerCase();
      return ADULT_DOMAINS.some(domain => lowerUrl.includes(domain));
    });

    // 2. Profile Texts
    const profileWords = [
      ...detectWords(draftProfile.display_name),
      ...detectWords(draftProfile.bio)
    ];
    const profileStatus = profileWords.length > 0 ? "warning" : "safe";

    // 3. Link Titles
    const linkTitlesWithRisk = draftLinks.filter(link => detectWords(link.title).length > 0);
    const linkTitlesStatus = linkTitlesWithRisk.length > 0 ? "warning" : "safe";

    // 4. SEO Metadatos
    const seoWords = [
      ...detectWords(draftProfile.seo_title),
      ...detectWords(draftProfile.seo_description)
    ];
    const seoStatus = seoWords.length > 0 ? "warning" : "safe";

    return {
      links: {
        id: "links" as const,
        name: "Enlaces expuestos",
        status: "safe" as const,
        icon: PiLink,
        subtitle: adultLinks.length > 0 
          ? `${adultLinks.length} enlace(s) sensible(s) protegido(s) con enmascaramiento dinámico`
          : "Sin enlaces expuestos o sensibles directos",
        adultLinks
      },
      profile: {
        id: "profile" as const,
        name: "Textos del Perfil",
        status: profileStatus,
        icon: PiUser,
        subtitle: profileStatus === "warning"
          ? `${profileWords.length} palabra(s) de riesgo encontradas`
          : "Nombre y biografía sin palabras de riesgo",
        words: profileWords
      },
      link_titles: {
        id: "link_titles" as const,
        name: "Títulos de los Enlaces",
        status: linkTitlesStatus,
        icon: PiNotebook,
        subtitle: linkTitlesStatus === "warning"
          ? `${linkTitlesWithRisk.length} botón(es) con palabras de riesgo`
          : "Todos los títulos de botones están limpios",
        riskyLinks: linkTitlesWithRisk
      },
      seo: {
        id: "seo" as const,
        name: "Metadatos SEO",
        status: seoStatus,
        icon: PiGlobe,
        subtitle: seoStatus === "warning"
          ? `${seoWords.length} palabra(s) de riesgo encontradas en SEO`
          : "Títulos y descripción SEO seguros",
        words: seoWords
      }
    };
  };

  const statuses = getCategoriesStatus();
  
  // Calculate total score based on remaining risks
  const totalIssuesCount = 
    (statuses.profile.status === "warning" ? statuses.profile.words.length : 0) +
    (statuses.link_titles.status === "warning" ? statuses.link_titles.riskyLinks.length : 0) +
    (statuses.seo.status === "warning" ? statuses.seo.words.length : 0);

  const score = Math.max(0, 100 - totalIssuesCount * 15);

  const handleSaveDetail = async () => {
    setSaving(true);
    try {
      await onFix(draftProfile, draftLinks);
      setView("main");
    } catch (err) {
      console.error("Error saving updates:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoFix = async () => {
    if (userPlan === "free") {
      onOpenUpgradeModal("Cerrojo de Seguridad Pro");
      return;
    }

    setSaving(true);
    try {
      const replacements: Record<string, string> = {
        onlyfans: "Canal Privado",
        fansly: "VIP Space",
        sex: "Premium",
        nudes: "Contenido VIP",
        porn: "Privado",
        naked: "Exclusivo",
        xxx: "VIP",
        of: "VIP",
        "+18": "Exclusivo",
        "18+": "Exclusivo",
      };

      const replaceText = (text: string) => {
        if (!text) return text;
        let newText = text;
        Object.keys(replacements).forEach((word) => {
          const regex = new RegExp(word === "of" ? `\\b${word}\\b` : word, "gi");
          newText = newText.replace(regex, replacements[word]);
        });
        return newText;
      };

      const newProfile = {
        display_name: replaceText(draftProfile.display_name),
        bio: replaceText(draftProfile.bio),
        seo_title: replaceText(draftProfile.seo_title),
        seo_description: replaceText(draftProfile.seo_description),
      };

      const newLinks = draftLinks.map((link) => {
        const hasRisk = detectWords(link.title).length > 0;
        if (hasRisk) {
          return {
            ...link,
            title: replaceText(link.title),
          };
        }
        return link;
      });

      await onFix(newProfile, newLinks);
      setDraftProfile(newProfile);
      setDraftLinks(newLinks);
      setView("main");
    } catch (err) {
      console.error("Error applying autofix:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#eeeeee] dark:border-[#222] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            {view === "detail" ? (
              <button 
                onClick={() => setView("main")}
                className="p-2 text-[#999] hover:text-[#111] dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#222] rounded-full"
              >
                <PiArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className={`p-2 rounded-xl ${score === 100 ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/30 text-amber-600"}`}>
                <PiShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-[#111] dark:text-white flex items-center gap-2">
                {view === "detail" ? statuses[selectedCategory].name : "Auditoría de Enlaces y Perfil"}
                {userPlan === "free" && (
                  <span className="text-[10px] font-bold bg-[#111] dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <PiLock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#999]">
                {view === "detail" ? "Corrige y personaliza para evitar bloqueos" : "Protege tu cuenta de Instagram frente a bloqueos"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#999] hover:text-[#111] dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#222] rounded-full"
          >
            <PiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {view === "main" ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Score circle */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${
              score === 100 
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30" 
                : "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30"
            }`}>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#999]">Nivel de Seguridad</span>
                <h3 className={`text-2xl font-black ${
                  score === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {score === 100 ? "Perfil Seguro" : "Riesgo Moderado"}
                </h3>
                <p className="text-xs text-[#666] dark:text-[#a1a1aa] max-w-sm">
                  {score === 100 
                    ? "Tu perfil no contiene textos o enlaces directos expuestos que puedan alertar a los bots de Instagram."
                    : "Hemos encontrado detalles que pueden causar limitaciones en tu biografía de Instagram. Te aconsejamos modificarlos."
                  }
                </p>
              </div>
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-black text-xl ${
                  score === 100 ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600"
                }`}>
                  {score}%
                </div>
              </div>
            </div>

            {/* List of categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#999] px-1">Detalle del Análisis</h4>
              <div className="space-y-3">
                {Object.values(statuses).map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <div 
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setView("detail");
                      }}
                      className="flex items-center justify-between p-4 border border-[#eeeeee] dark:border-[#222] hover:border-[#d0d0d0] dark:hover:border-[#444] rounded-2xl cursor-pointer bg-white dark:bg-[#0c0c0c] transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            cat.status === "safe" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                              : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                          }`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <span className="flex h-3 w-3 relative">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                cat.status === "safe" ? "bg-emerald-400" : "bg-amber-400"
                              }`}></span>
                              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                                cat.status === "safe" ? "bg-emerald-500" : "bg-amber-500"
                              }`}></span>
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-[#111] dark:text-white">{cat.name}</h5>
                          <p className="text-xs text-[#888] dark:text-[#a1a1aa] mt-0.5 truncate">{cat.subtitle}</p>
                        </div>
                      </div>
                      <PiCaretRight className="w-5 h-5 text-[#999] group-hover:text-[#111] dark:group-hover:text-white transition-colors flex-shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <PiShieldCheck className="w-4 h-4" /> ¿Cómo funciona la protección de enlaces?
              </p>
              <p>
                Los enlaces de plataformas sensibles (OnlyFans, Fansly, etc.) se enmascaran automáticamente con codificación en Base64. Esto los hace invisibles a los rastreadores automatizados de Instagram.
              </p>
              <p>
                Para los visitantes de tu perfil, la navegación es normal, pero protegida de denuncias automatizadas y escaneos de Instagram.
              </p>
            </div>
          </div>
        ) : (
          /* Detail view */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
            
            {selectedCategory === "links" && (
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-[#f9f9f9] dark:bg-[#111] border border-[#eee] dark:border-[#222] rounded-2xl text-xs text-[#666] dark:text-[#aaa] leading-relaxed space-y-1.5">
                  <p className="font-bold text-[#111] dark:text-white flex items-center gap-1">
                    <PiCheckCircle className="w-4 h-4 text-emerald-500" /> Enmascaramiento Dinámico Activo
                  </p>
                  <p>
                    Todos tus enlaces sensibles están cifrados en Base64. Están seguros de cara al crawler de Instagram. Aquí tienes los detalles detectados:
                  </p>
                </div>

                <div className="space-y-3">
                  {statuses.links.adultLinks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[#888] dark:text-[#aaa]">
                      No tienes enlaces a plataformas de contenido exclusivo registradas.
                    </div>
                  ) : (
                    statuses.links.adultLinks.map((link, idx) => (
                      <div key={link.id || idx} className="p-4 border border-[#eeeeee] dark:border-[#222] rounded-2xl bg-white dark:bg-[#0c0c0c] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111] dark:text-white truncate max-w-[70%]">
                            {link.title}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <PiShieldCheck className="w-3.5 h-3.5" /> Enmascarado y Seguro
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#999] tracking-wider">Título del botón</label>
                            <input 
                              type="text"
                              value={link.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setDraftLinks(prev => prev.map(l => l.id === link.id ? { ...l, title: newTitle } : l));
                              }}
                              className="w-full text-sm bg-gray-50 dark:bg-[#111] border border-[#eee] dark:border-[#222] rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#999] tracking-wider">Enlace / URL</label>
                            <input 
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const newUrl = e.target.value;
                                setDraftLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: newUrl } : l));
                              }}
                              className="w-full text-sm bg-gray-50 dark:bg-[#111] border border-[#eee] dark:border-[#222] rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedCategory === "profile" && (
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  Evita palabras explícitas o de contenido adulto directo en el nombre y en la biografía de tu perfil público para prevenir limitaciones algorítmicas en redes.
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#555] dark:text-[#aaa]">Nombre de Pantalla</label>
                      {detectWords(draftProfile.display_name).length > 0 && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                          <PiWarningCircle className="w-3.5 h-3.5" /> Palabra sospechosa
                        </span>
                      )}
                    </div>
                    <input 
                      type="text"
                      value={draftProfile.display_name}
                      onChange={(e) => setDraftProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      className={`w-full text-sm bg-gray-50 dark:bg-[#111] border rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all ${
                        detectWords(draftProfile.display_name).length > 0 
                          ? "border-amber-400 bg-amber-50/10" 
                          : "border-[#eee] dark:border-[#222]"
                      }`}
                    />
                    {detectWords(draftProfile.display_name).length > 0 && (
                      <p className="text-[10px] text-amber-600">
                        Detectado: {detectWords(draftProfile.display_name).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#555] dark:text-[#aaa]">Biografía</label>
                      {detectWords(draftProfile.bio).length > 0 && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                          <PiWarningCircle className="w-3.5 h-3.5" /> Palabra sospechosa
                        </span>
                      )}
                    </div>
                    <textarea 
                      value={draftProfile.bio}
                      rows={4}
                      onChange={(e) => setDraftProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className={`w-full text-sm bg-gray-50 dark:bg-[#111] border rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all ${
                        detectWords(draftProfile.bio).length > 0 
                          ? "border-amber-400 bg-amber-50/10" 
                          : "border-[#eee] dark:border-[#222]"
                      }`}
                    />
                    {detectWords(draftProfile.bio).length > 0 && (
                      <p className="text-[10px] text-amber-600">
                        Detectado: {detectWords(draftProfile.bio).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === "link_titles" && (
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  Edita los títulos de tus botones aquí. Evita el uso de palabras explícitas como "OnlyFans" en los textos visibles de los botones. Cámbialas por alternativas como "Contenido exclusivo" o "VIP Space".
                </div>

                <div className="space-y-3">
                  {draftLinks.map((link, idx) => {
                    const isRisky = detectWords(link.title).length > 0;
                    return (
                      <div key={link.id || idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#555] dark:text-[#aaa] truncate max-w-[70%]">
                            Enlace: {link.url}
                          </span>
                          {isRisky && (
                            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                              <PiWarningCircle className="w-3.5 h-3.5" /> Palabra de riesgo
                            </span>
                          )}
                        </div>
                        <input 
                          type="text"
                          value={link.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setDraftLinks(prev => prev.map(l => l.id === link.id ? { ...l, title: newTitle } : l));
                          }}
                          className={`w-full text-sm bg-gray-50 dark:bg-[#111] border rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all ${
                            isRisky 
                              ? "border-amber-400 bg-amber-50/10" 
                              : "border-[#eee] dark:border-[#222]"
                          }`}
                        />
                        {isRisky && (
                          <p className="text-[10px] text-amber-600">
                            Palabras detectadas: {detectWords(link.title).join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedCategory === "seo" && (
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  Los metadatos de indexación SEO (los que lee Google y al compartir links en WhatsApp o Telegram) también son escaneados. Manténlos profesionales y discretos.
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#555] dark:text-[#aaa]">Título SEO</label>
                      {detectWords(draftProfile.seo_title).length > 0 && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                          <PiWarningCircle className="w-3.5 h-3.5" /> Palabra sospechosa
                        </span>
                      )}
                    </div>
                    <input 
                      type="text"
                      value={draftProfile.seo_title}
                      onChange={(e) => setDraftProfile(prev => ({ ...prev, seo_title: e.target.value }))}
                      className={`w-full text-sm bg-gray-50 dark:bg-[#111] border rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all ${
                        detectWords(draftProfile.seo_title).length > 0 
                          ? "border-amber-400 bg-amber-50/10" 
                          : "border-[#eee] dark:border-[#222]"
                      }`}
                    />
                    {detectWords(draftProfile.seo_title).length > 0 && (
                      <p className="text-[10px] text-amber-600">
                        Detectado: {detectWords(draftProfile.seo_title).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#555] dark:text-[#aaa]">Descripción SEO</label>
                      {detectWords(draftProfile.seo_description).length > 0 && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                          <PiWarningCircle className="w-3.5 h-3.5" /> Palabra sospechosa
                        </span>
                      )}
                    </div>
                    <textarea 
                      value={draftProfile.seo_description}
                      rows={4}
                      onChange={(e) => setDraftProfile(prev => ({ ...prev, seo_description: e.target.value }))}
                      className={`w-full text-sm bg-gray-50 dark:bg-[#111] border rounded-xl px-3 py-2 text-[#111] dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all ${
                        detectWords(draftProfile.seo_description).length > 0 
                          ? "border-amber-400 bg-amber-50/10" 
                          : "border-[#eee] dark:border-[#222]"
                      }`}
                    />
                    {detectWords(draftProfile.seo_description).length > 0 && (
                      <p className="text-[10px] text-amber-600">
                        Detectado: {detectWords(draftProfile.seo_description).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer actions */}
        <div className="p-6 border-t border-[#eeeeee] dark:border-[#222] bg-gray-50 dark:bg-[#0c0c0c] flex flex-col gap-3">
          {view === "main" ? (
            <>
              {score < 100 && (
                <button
                  onClick={handleAutoFix}
                  disabled={saving}
                  className="w-full bg-[#111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  {saving ? (
                    <>
                      <PiSpinner className="w-4 h-4 animate-spin" />
                      Aplicando corrección segura...
                    </>
                  ) : (
                    <>
                      <PiShieldCheck className="w-4 h-4" />
                      Aplicar Cerrojo y Corregir Automáticamente
                      <PiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-[#777] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
              >
                Cerrar análisis
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setView("main")}
                className="flex-1 py-3.5 border border-[#eee] dark:border-[#222] rounded-2xl font-semibold text-sm text-[#777] bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDetail}
                disabled={saving}
                className="flex-1 bg-[#111] dark:bg-white text-white dark:text-black py-3.5 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {saving ? (
                  <PiSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  "Guardar y Corregir"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
