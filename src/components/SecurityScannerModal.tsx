"use client";

import { useState, useEffect } from "react";
import { X, Shield, AlertTriangle, CheckCircle, ArrowRight, Loader2, Lock } from "lucide-react";

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
  const [scanning, setScanning] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [score, setScore] = useState(100); // 100 is safe, 0 is critical risk
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      runScan();
    }
  }, [isOpen, profile, links]);

  const runScan = () => {
    setScanning(true);
    setFixed(false);
    const detectedIssues: any[] = [];
    let currentScore = 100;

    // Helper to check texts
    const checkText = (text: string, source: string, type: "profile" | "link", linkId?: string) => {
      if (!text) return;
      const lowerText = text.toLowerCase();

      HIGH_RISK_WORDS.forEach((word) => {
        if (lowerText.includes(word)) {
          detectedIssues.push({
            id: `${source}-${word}`,
            type: "text_high",
            source,
            detail: `Palabra de alto riesgo "${word}" encontrada en ${source}.`,
            original: text,
            word,
            linkId,
            contentType: type,
          });
          currentScore -= 20;
        }
      });

      MEDIUM_RISK_WORDS.forEach((word) => {
        // Use word boundary check for short words like "of"
        const isMatch = word === "of" 
          ? new RegExp(`\\b${word}\\b`, "i").test(text)
          : lowerText.includes(word);

        if (isMatch) {
          detectedIssues.push({
            id: `${source}-${word}`,
            type: "text_medium",
            source,
            detail: `Palabra sospechosa "${word}" encontrada en ${source}.`,
            original: text,
            word,
            linkId,
            contentType: type,
          });
          currentScore -= 10;
        }
      });
    };

    // Check profile text fields
    checkText(profile.display_name, "Nombre Público", "profile");
    checkText(profile.bio, "Biografía", "profile");
    checkText(profile.seo_title, "Título SEO", "profile");
    checkText(profile.seo_description, "Descripción SEO", "profile");

    // Check links URL & Title
    links.forEach((link) => {
      checkText(link.title, `Título del enlace "${link.title}"`, "link", link.id);
      
      if (link.url) {
        const lowerUrl = link.url.toLowerCase();
        const matchedDomain = ADULT_DOMAINS.find(domain => lowerUrl.includes(domain));
        if (matchedDomain) {
          detectedIssues.push({
            id: `${link.id}-domain`,
            type: "url_critical",
            source: `Enlace "${link.title}"`,
            detail: `Redirección directa a un dominio sensible (${matchedDomain}).`,
            original: link.url,
            linkId: link.id,
            contentType: "link",
          });
          currentScore -= 30;
        }
      }
    });

    // Clamp score
    setScore(Math.max(0, currentScore));
    setIssues(detectedIssues);
    setScanning(false);
  };

  const handleFix = async () => {
    if (userPlan === "free") {
      onOpenUpgradeModal("Cerrojo de Seguridad Pro");
      return;
    }

    setFixing(true);
    try {
      // Build text replacements
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

      // 1. Prepare profile updates
      const profileUpdates = {
        display_name: replaceText(profile.display_name),
        bio: replaceText(profile.bio),
        seo_title: replaceText(profile.seo_title),
        seo_description: replaceText(profile.seo_description),
      };

      // 2. Prepare links updates (only title replacements)
      const linksUpdates = links.map((link) => {
        const hasIssue = issues.some(iss => iss.linkId === link.id && iss.type !== "url_critical");
        if (hasIssue) {
          return {
            ...link,
            title: replaceText(link.title),
          };
        }
        return link;
      });

      // Call parent callback to persist updates
      await onFix(profileUpdates, linksUpdates);
      setFixed(true);
      runScan();
    } catch (err) {
      console.error("Error fixing security issues:", err);
    } finally {
      setFixing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#eeeeee] dark:border-[#222] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${score === 100 ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/30 text-amber-600"}`}>
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111] dark:text-white flex items-center gap-2">
                Auditoría de Enlaces y Perfil
                {userPlan === "free" && (
                  <span className="text-[10px] font-bold bg-[#111] dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#999]">Protege tu cuenta de Instagram frente a bloqueos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#999] hover:text-[#111] dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#222] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Status */}
        {scanning ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#111] dark:text-white" />
            <p className="text-sm font-semibold text-[#555] dark:text-[#a1a1aa]">Escaneando metadatos, enlaces y descripciones...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Score circle / card */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${
              score === 100 
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30" 
                : score >= 60 
                  ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30" 
                  : "bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/30"
            }`}>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#999]">Nivel de Seguridad</span>
                <h3 className={`text-2xl font-black ${
                  score === 100 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {score === 100 ? "Perfil Seguro" : score >= 60 ? "Riesgo Moderado" : "Riesgo Alto"}
                </h3>
                <p className="text-xs text-[#666] dark:text-[#a1a1aa] max-w-sm">
                  {score === 100 
                    ? "Tu perfil no contiene textos o enlaces directos que puedan alertar a los bots de Instagram."
                    : "Hemos encontrado detalles que pueden causar limitaciones en tu biografía de Instagram. Recomendamos aplicar el Cerrojo."
                  }
                </p>
              </div>
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-black text-xl ${
                  score === 100 ? "border-emerald-500 text-emerald-600" : score >= 60 ? "border-amber-500 text-amber-600" : "border-red-500 text-red-600"
                }`}>
                  {score}%
                </div>
              </div>
            </div>

            {/* List of issues */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#999] px-1">Detalle del Análisis</h4>
              {issues.length === 0 ? (
                <div className="p-5 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/5 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">¡Todo en orden! No se encontraron enlaces de riesgo ni palabras restringidas.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {issues.map((issue) => (
                    <div 
                      key={issue.id} 
                      className={`p-4 border rounded-2xl flex items-start gap-3 transition-colors ${
                        issue.type === "url_critical" 
                          ? "bg-red-50/20 dark:bg-red-950/5 border-red-100 dark:border-red-900/20 text-red-800 dark:text-red-400" 
                          : "bg-amber-50/20 dark:bg-amber-950/5 border-amber-100 dark:border-amber-900/20 text-amber-800 dark:text-amber-400"
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-snug">{issue.detail}</p>
                        {issue.type === "url_critical" ? (
                          <div className="mt-1.5 p-2 bg-red-100/50 dark:bg-red-950/30 rounded-lg text-xs font-medium space-y-1">
                            <p className="truncate text-red-700 dark:text-red-300">URL original: {issue.original}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                              ✓ Enmascaramiento dinámico activado automáticamente para este link.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1.5 p-2 bg-amber-100/50 dark:bg-amber-950/30 rounded-lg text-xs font-mono truncate text-amber-700 dark:text-amber-300">
                            Detectado en: "{issue.original}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explanatory notes */}
            {issues.some(iss => iss.type === "url_critical") && (
              <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> ¿Cómo funciona el Cerrojo en tus enlaces?
                </p>
                <p>
                  Para proteger tu cuenta, **Bioly** oculta automáticamente tus enlaces sensibles en el código HTML de tu perfil mediante codificación en base de datos. Ningún crawler automatizado de Instagram podrá leer tu URL de OnlyFans.
                </p>
                <p>
                  Cuando un usuario real haga clic, se mostrará el modal de advertencia +18 para evitar denuncias directas y luego se iniciará la redirección encriptada de forma segura.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        {!scanning && (
          <div className="p-6 border-t border-[#eeeeee] dark:border-[#222] bg-gray-50 dark:bg-[#0c0c0c] flex flex-col gap-3">
            {issues.length > 0 && (
              <button
                onClick={handleFix}
                disabled={fixing}
                className="w-full bg-[#111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-md"
              >
                {fixing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aplicando corrección segura...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Aplicar Cerrojo y Corregir Errores
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-[#777] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
            >
              Cerrar análisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
