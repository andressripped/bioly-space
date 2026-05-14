"use client";

import { PlatformIcon } from "@/components/PlatformIcon";
import { Share2 } from "lucide-react";

interface ProfileViewProps {
  profile: any;
  links: any[];
}

export default function ProfileView({ profile, links }: ProfileViewProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.display_name,
        text: profile.bio,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fcfcfc] dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* HEADER / BANNER AREA */}
      <div 
        className="w-full h-40 sm:h-52 transition-colors duration-1000" 
        style={{ backgroundColor: profile.theme_color || "#111111" }}
      ></div>

      {/* CONTENT AREA */}
      <main className="w-full max-w-xl px-6 -mt-16 sm:-mt-20 pb-20 flex flex-col items-center">
        
        {/* AVATAR */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-[#fcfcfc] dark:bg-[#050505] shadow-2xl mb-6 relative">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-[#111] border border-black/5 dark:border-white/5">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold opacity-20">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleShare}
            className="absolute bottom-2 right-2 p-3 bg-white dark:bg-[#111] rounded-full shadow-xl border border-[#eeeeee] dark:border-[#222] hover:scale-110 active:scale-95 transition-all"
          >
            <Share2 className="w-5 h-5 text-[#111111] dark:text-white" />
          </button>
        </div>

        {/* INFO */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#111111] dark:text-white">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-base text-[#666666] dark:text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
            {profile.bio || "Bienvenido a mi espacio digital."}
          </p>
        </div>

        {/* LINKS GRID */}
        <div className="w-full space-y-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center p-4 sm:p-5 bg-white dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2rem] hover:border-[#111111] dark:hover:border-white hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#f9fafb] dark:bg-[#111] rounded-2xl border border-[#eeeeee] dark:border-[#222] group-hover:bg-[#111111] dark:group-hover:bg-white transition-colors">
                <PlatformIcon 
                  id={link.icon} 
                  className="w-6 h-6 text-[#111111] dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" 
                />
              </div>
              
              <div className="flex-1 ml-4 text-left">
                <h3 className="font-bold text-lg text-[#111111] dark:text-white tracking-tight">{link.title}</h3>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <svg className="w-5 h-5 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          ))}

          {links.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <p className="text-sm italic">Este usuario aún no ha añadido enlaces.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-20 flex flex-col items-center gap-4">
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
