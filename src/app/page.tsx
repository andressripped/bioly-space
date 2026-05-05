"use client";

import { motion } from "framer-motion";
import { Globe, ArrowRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/icons";
import { useTheme } from "next-themes";

const translations = {
  EN: {
    badge: "For the new generation of creators",
    title: "Claim your digital identity.",
    subtitle: "Consolidate your links, content, and business in an elegant space designed to convert followers into clients.",
    placeholder: "username",
    claim: "Claim link",
    trusted: "Trusted by top-tier creators",
    mock_card1_title: "My Merch Store",
    mock_card1_desc: "Shop the summer collection",
    mock_card2_title: "Podcast Episode",
    mock_card2_desc: "Listen to the new interview",
    mock_vlog: "LATEST VLOG",
  },
  ES: {
    badge: "Para la nueva generación de creadores",
    title: "Reclama tu identidad digital.",
    subtitle: "Consolida tus enlaces, contenido y negocio en un espacio elegante diseñado para convertir seguidores en clientes.",
    placeholder: "usuario",
    claim: "Reclamar enlace",
    trusted: "Con la confianza de creadores top",
    mock_card1_title: "Mi Tienda Oficial",
    mock_card1_desc: "Compra la nueva colección",
    mock_card2_title: "Nuevo Podcast",
    mock_card2_desc: "Escucha mi última entrevista",
    mock_vlog: "ÚLTIMO VLOG",
  },
  PT: {
    badge: "Para a nova geração de criadores",
    title: "Reivindique sua identidade digital.",
    subtitle: "Consolide seus links, conteúdo e negócios em um espaço elegante projetado para converter seguidores em clientes.",
    placeholder: "usuario",
    claim: "Criar link",
    trusted: "Aprovado por criadores top",
    mock_card1_title: "Minha Loja Oficial",
    mock_card1_desc: "Compre a nova coleção",
    mock_card2_title: "Novo Podcast",
    mock_card2_desc: "Ouça a última entrevista",
    mock_vlog: "ÚLTIMO VLOG",
  }
};

type Locale = "EN" | "ES" | "PT";

export default function Home() {
  const [lang, setLang] = useState<Locale>("EN");
  const [mounted, setMounted] = useState(false);
  const [claimUsername, setClaimUsername] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const userLang = navigator.language.toUpperCase();
    if (userLang.includes("ES")) setLang("ES");
    else if (userLang.includes("PT")) setLang("PT");
    else setLang("EN");
  }, []);

  if (!mounted) return null;

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] selection:bg-[#111111] selection:text-white dark:selection:bg-white dark:selection:text-black font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-[#eeeeee] dark:border-[#222222] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-extrabold tracking-tighter">bioly.</div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-[#555555] dark:text-[#a1a1aa]">
              <Globe className="w-4 h-4" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Locale)}
                className="bg-transparent border-none focus:outline-none cursor-pointer uppercase tracking-wider"
              >
                <option value="EN">EN</option>
                <option value="ES">ES</option>
                <option value="PT">PT</option>
              </select>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#111] transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/login" className="text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-all shadow-sm active:scale-[0.98]">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* TEXT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="inline-block border border-[#eeeeee] dark:border-[#222] rounded-full px-4 py-1.5 mb-8 bg-[#f9fafb] dark:bg-[#0a0a0a]">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#555555] dark:text-[#888]">{t.badge}</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-serif text-[#111111] dark:text-white tracking-tight mb-6 leading-[1.1]">
              {t.title}
            </h1>
            
            <p className="text-lg text-[#555555] dark:text-[#a1a1aa] mb-10 font-light leading-relaxed">
              {t.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] dark:text-[#666] font-medium">bioly.space/</span>
                <input 
                  type="text" 
                  placeholder={t.placeholder}
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  className="w-full bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-xl py-4 pl-[110px] pr-4 text-[#111111] dark:text-white font-medium focus:outline-none focus:border-[#111111] dark:focus:border-[#666] transition-colors"
                />
              </div>
              <Link 
                href={`/login?username=${claimUsername}`} 
                className="bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-medium hover:bg-black dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
              >
                {t.claim}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm text-[#999999] dark:text-[#666] font-medium">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Creator" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80" alt="Creator" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Creator" /></div>
              </div>
              {t.trusted}
            </div>
          </motion.div>

          {/* REALISTIC IPHONE MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="relative hidden lg:flex justify-center"
          >
            {/* Phone Hardware */}
            <div className="relative w-[340px] h-[720px] bg-[#f5f5f7] dark:bg-[#111] rounded-[3.5rem] shadow-2xl p-[12px] shadow-black/10 dark:shadow-white/5 border border-[#e5e5e5] dark:border-[#222] transition-colors duration-300">
              
              {/* Hardware Buttons */}
              <div className="absolute top-[120px] -left-[2px] w-[2px] h-[26px] bg-[#d1d1d6] dark:bg-[#333] rounded-l-sm transition-colors duration-300" />
              <div className="absolute top-[170px] -left-[2px] w-[2px] h-[50px] bg-[#d1d1d6] dark:bg-[#333] rounded-l-sm transition-colors duration-300" />
              <div className="absolute top-[235px] -left-[2px] w-[2px] h-[50px] bg-[#d1d1d6] dark:bg-[#333] rounded-l-sm transition-colors duration-300" />
              <div className="absolute top-[190px] -right-[2px] w-[2px] h-[75px] bg-[#d1d1d6] dark:bg-[#333] rounded-r-sm transition-colors duration-300" />

              {/* Screen */}
              <div className="relative w-full h-full bg-[#ffffff] dark:bg-[#0a0a0a] rounded-[2.8rem] overflow-hidden isolate transition-colors duration-300">
                
                {/* Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-end px-3">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                    <div className="w-[4px] h-[4px] rounded-full bg-blue-900/40" />
                  </div>
                </div>

                {/* UI Inside Screen */}
                <div className="w-full h-full overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {/* Cover */}
                  <div className="w-full h-[280px] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white dark:to-[#0a0a0a] z-10 transition-colors duration-300" />
                    <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80" alt="Cover" className="w-full h-full object-cover object-top" />
                  </div>

                  {/* Profile Info */}
                  <div className="relative z-20 -mt-20 px-5 text-center pb-24">
                    <div className="w-28 h-28 mx-auto rounded-full p-1 bg-white dark:bg-[#0a0a0a] mb-4 shadow-xl transition-colors duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif text-[#111111] dark:text-white mb-1">Janice Rivera</h2>
                    <p className="text-[#555555] dark:text-[#a1a1aa] text-sm mb-6 font-medium">@janice</p>

                    {/* Social Circles */}
                    <div className="flex justify-center gap-4 mb-6">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                          <InstagramIcon className="w-6 h-6 text-white" />
                       </div>
                       <div className="w-12 h-12 rounded-full bg-black dark:bg-[#222] border dark:border-[#333] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                          <TiktokIcon className="w-6 h-6 text-white" />
                       </div>
                       <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                          <YoutubeIcon className="w-6 h-6 text-white" />
                       </div>
                    </div>

                    {/* Link Cards */}
                    <div className="space-y-3">
                      <div className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-[1rem] p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <span className="text-xl">👕</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#111111] dark:text-white">{t.mock_card1_title}</h3>
                          <p className="text-xs text-[#555555] dark:text-[#a1a1aa]">{t.mock_card1_desc}</p>
                        </div>
                      </div>

                      <div className="w-full bg-[#f9fafb] dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-[1rem] p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left">
                        <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                          <span className="text-xl">🎧</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#111111] dark:text-white">{t.mock_card2_title}</h3>
                          <p className="text-xs text-[#555555] dark:text-[#a1a1aa]">{t.mock_card2_desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="py-24 px-6 bg-[#f9fafb] dark:bg-[#0a0a0a] border-t border-[#eeeeee] dark:border-[#222] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-[#111] rounded-3xl p-10 border border-[#eeeeee] dark:border-[#222] shadow-sm transition-colors duration-300">
              <h3 className="text-3xl font-serif text-[#111111] dark:text-white mb-4">Múltiples Enlaces. Un solo destino.</h3>
              <p className="text-[#555555] dark:text-[#a1a1aa] max-w-md text-lg">Organiza tu portafolio, tiendas y redes sociales en un hub centralizado con un diseño impecable.</p>
            </div>
            <div className="bg-white dark:bg-[#111] rounded-3xl p-10 border border-[#eeeeee] dark:border-[#222] shadow-sm flex flex-col justify-between transition-colors duration-300">
              <h3 className="text-3xl font-serif text-[#111111] dark:text-white">Analíticas<br/>en tiempo real</h3>
              <p className="text-[#555555] dark:text-[#a1a1aa] mt-4">Mide tu impacto visualmente.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
