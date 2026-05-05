"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const userParam = searchParams.get("username");
    if (userParam) {
      setUsername(userParam);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // Guardamos el username si existe
    if (username) {
      localStorage.setItem("pending_username", username);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campo de usuario (opcional si ya tiene cuenta, pero útil para nuevos) */}
      <div>
        <label className="block text-sm font-medium text-[#111111] dark:text-[#a1a1aa] mb-2 ml-1">Tu nombre de usuario</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] dark:text-[#666] font-medium transition-colors duration-300">bioly.space/</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#333] rounded-2xl py-4 pl-[109px] pr-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all font-medium shadow-sm"
            placeholder="usuario"
          />
        </div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-[#111111] dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 brightness-0 invert dark:brightness-100 dark:invert-0" alt="Google" />
            Continuar con Google
          </>
        )}
      </button>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-40 flex items-center justify-center"><span className="w-8 h-8 border-4 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin" /></div>}>
      <LoginFormInner />
    </Suspense>
  );
}
