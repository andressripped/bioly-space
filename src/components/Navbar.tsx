"use client";

import Link from "next/link";
import { PiGlobe, PiMoon, PiSun } from "react-icons/pi";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface NavbarProps {
  lang?: string;
  setLang?: (lang: any) => void;
  t?: any;
}

export function Navbar({ lang, setLang, t }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-[#eeeeee] dark:border-[#222222] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter hover:opacity-80 transition-opacity">
          bioly.
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {setLang && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-[#555555] dark:text-[#a1a1aa]">
              <PiGlobe className="w-4 h-4" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer uppercase tracking-wider"
              >
                <option value="EN">EN</option>
                <option value="ES">ES</option>
                <option value="PT">PT</option>
              </select>
            </div>
          )}

          <Link href="/pricing" className="text-sm font-medium text-[#555555] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors">
            {lang === 'ES' ? 'Precios' : lang === 'PT' ? 'Preços' : 'Pricing'}
          </Link>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#111] transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {mounted && (theme === 'dark' ? <PiSun className="w-4 h-4" /> : <PiMoon className="w-4 h-4" />)}
          </button>

          <Link href="/login" className="text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
            {t?.nav_login || (lang === 'ES' ? 'Entrar' : 'Sign in')}
          </Link>
        </div>
      </div>
    </header>
  );
}
