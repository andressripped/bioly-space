"use client";

import { motion } from "framer-motion";
import { PiArrowRight, PiTShirt, PiHeadphones } from "react-icons/pi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const translations = {
  EN: {
    badge: "One link for everything you are",
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
    nav_login: "Sign in",
    bento_title1: "Multiple links. One destination.",
    bento_desc1: "Organize your portfolio, stores and social media in a centralized hub with impeccable design.",
    bento_title2: "Know your audience.",
    bento_desc2: "Real-time analytics on every view and click, visualized beautifully — no spreadsheets required.",
    cta_title: "Your space. Your rules.",
    cta_subtitle: "Free to start. Ready in under a minute.",
  },
  ES: {
    badge: "Un solo link para todo lo que eres",
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
    nav_login: "Entrar",
    bento_title1: "Múltiples enlaces. Un solo destino.",
    bento_desc1: "Organiza tu portafolio, tiendas y redes sociales en un hub centralizado con un diseño impecable.",
    bento_title2: "Conoce a tu audiencia.",
    bento_desc2: "Analíticas en tiempo real de cada vista y cada clic, visualizadas de forma hermosa — sin hojas de cálculo.",
    cta_title: "Tu espacio. Tus reglas.",
    cta_subtitle: "Gratis para empezar. Listo en menos de un minuto.",
  },
  PT: {
    badge: "Um único link para tudo o que você é",
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
    nav_login: "Entrar",
    bento_title1: "Múltiplos links. Um único destino.",
    bento_desc1: "Organize seu portfólio, lojas e redes sociais em um hub centralizado com design impecável.",
    bento_title2: "Conheça seu público.",
    bento_desc2: "Análises em tempo real de cada visualização e clique, visualizadas com beleza — sem planilhas.",
    cta_title: "Seu espaço. Suas regras.",
    cta_subtitle: "Grátis para começar. Pronto em menos de um minuto.",
  }
};

type Locale = "EN" | "ES" | "PT";

const EXAMPLE_USERNAMES = ["maria", "estudio.creativo", "juan.musica", "laura.fit", "elpatio.cafe"];

function TypingClaim() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = EXAMPLE_USERNAMES[wordIndex];
    const delay = deleting ? 45 : charCount === word.length ? 1400 : 90;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (charCount < word.length) {
          setCharCount((c) => c + 1);
        } else {
          setDeleting(true);
        }
      } else {
        if (charCount > 0) {
          setCharCount((c) => c - 1);
        } else {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % EXAMPLE_USERNAMES.length);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [charCount, deleting, wordIndex]);

  const visible = EXAMPLE_USERNAMES[wordIndex].slice(0, charCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <div className="font-mono text-3xl sm:text-4xl lg:text-5xl flex items-baseline justify-center flex-wrap gap-x-1">
        <span className="text-[#bbbbbb] dark:text-[#444]">bioly.space/</span>
        <span className="text-[#111111] dark:text-white font-bold">{visible}</span>
        <span className="w-[3px] h-[0.85em] bg-[#111111] dark:bg-white animate-pulse translate-y-[1px]" />
      </div>
      <div className="mt-5 flex items-center gap-1.5 text-xs text-[#999999] dark:text-[#666]">
        <span className="w-1 h-1 rounded-full bg-emerald-500" />
        Disponible
      </div>
    </motion.div>
  );
}

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

  const t = translations[mounted ? lang : "ES"];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] selection:bg-[#111111] selection:text-white dark:selection:bg-white dark:selection:text-black font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* HEADER */}
      <Navbar lang={lang} setLang={setLang} t={t} />

      {/* HERO SECTION */}
      <section className="pt-28 pb-10 lg:pt-40 lg:pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">

          {/* TEXT CONTENT — fills the first mobile viewport on its own, so the visual only appears on scroll */}
          <div className="max-w-xl min-h-[calc(100dvh-8rem)] lg:min-h-0 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#555555] dark:text-[#888]">{t.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-6xl md:text-7xl font-bold text-[#111111] dark:text-white tracking-tight mb-6 leading-[1.1]"
            >
              {t.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-lg text-[#555555] dark:text-[#a1a1aa] mb-10 font-light leading-relaxed"
            >
              {t.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="flex items-center gap-1 p-1.5 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border border-[#eeeeee] dark:border-[#222] rounded-2xl shadow-lg shadow-black/5 dark:shadow-white/5 max-w-md"
            >
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] dark:text-[#666] font-medium text-sm pointer-events-none">bioly.space/</span>
                <input
                  type="text"
                  placeholder={t.placeholder}
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  className="w-full bg-transparent py-3.5 pl-[98px] pr-3 text-[#111111] dark:text-white font-medium text-sm focus:outline-none"
                />
              </div>
              <Link
                href={`/login?username=${claimUsername}`}
                className="flex-shrink-0 bg-[#111111] dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group cursor-pointer"
              >
                {t.claim}
                <PiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex items-center gap-3 text-sm text-[#999999] dark:text-[#666] font-medium"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Creator" className="w-full h-full object-cover" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80" alt="Creator" className="w-full h-full object-cover" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Creator" className="w-full h-full object-cover" /></div>
              </div>
              {t.trusted}
            </motion.div>
          </div>

          {/* ABSTRACT HERO VISUAL — soft light + floating profile, no device chrome */}
          <div className="relative flex items-center justify-center py-10 lg:h-[560px] lg:py-0">
            <TypingClaim />
          </div>
        </div>
      </section>

      {/* STORY SECTION 1 — Links (light) */}
      <section className="py-14 sm:py-28 px-6 border-t border-[#eeeeee] dark:border-[#222] transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white mb-6 leading-tight max-w-md">
              {t.bento_title1}
            </h3>
            <p className="text-[#555555] dark:text-[#a1a1aa] max-w-md text-lg leading-relaxed font-light">
              {t.bento_desc1}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-1 lg:order-2 relative h-[360px] flex items-center justify-center"
          >
            {[
              { icon: PiTShirt, rotate: -6, x: -70, y: 30, title: "My Merch Store", tint: "emerald" },
              { icon: PiHeadphones, rotate: 3, x: 20, y: -20, title: "Podcast Episode", tint: "violet" },
              { icon: PiArrowRight, rotate: 10, x: 90, y: 40, title: "Latest Drop", tint: "amber" },
            ].map((card, i) => (
              <div
                key={i}
                className="absolute w-64 bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#222] rounded-2xl p-5 shadow-xl flex items-center gap-4"
                style={{ transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg)`, zIndex: i }}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  card.tint === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                  card.tint === "violet" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" :
                  "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                }`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="h-3 flex-1 bg-[#f0f0f0] dark:bg-[#222] rounded-full" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STORY SECTION 2 — Analytics (dark, inverted) */}
      <section className="py-14 sm:py-28 px-6 bg-[#0a0a0a] text-white transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-end justify-center gap-3 h-[280px] order-2 lg:order-1"
          >
            {[38, 62, 45, 80, 55, 95, 70].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                className="w-8 md:w-10 rounded-t-lg bg-gradient-to-t from-white/20 to-white"
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-md">
              {t.bento_title2}
            </h3>
            <p className="text-[#a1a1aa] max-w-md text-lg leading-relaxed font-light">
              {t.bento_desc2}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-16 sm:py-32 px-6 border-t border-[#eeeeee] dark:border-[#222] transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-center"
        >
          <h3 className="text-4xl md:text-6xl font-bold text-[#111111] dark:text-white mb-4 leading-tight">
            {t.cta_title}
          </h3>
          <p className="text-[#555555] dark:text-[#a1a1aa] text-lg mb-10 font-light">
            {t.cta_subtitle}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-medium hover:bg-black dark:hover:bg-gray-200 transition-colors group cursor-pointer"
          >
            {t.claim}
            <PiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
