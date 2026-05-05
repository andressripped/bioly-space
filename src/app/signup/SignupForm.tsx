"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function SignupFormInner() {
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

  const handleGoogleSignup = async () => {
    setLoading(true);
    
    // Guardamos el username deseado en el localStorage para recuperarlo tras el login de Google
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
      <div>
        <label className="block text-sm font-medium text-[#111111] dark:text-[#a1a1aa] mb-1.5 transition-colors duration-300">Tu nombre de usuario</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] dark:text-[#666] font-medium transition-colors duration-300">bioly.space/</span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white dark:bg-[#111] border border-[#eeeeee] dark:border-[#333] rounded-xl py-4 pl-[109px] pr-4 text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-[#888] transition-colors duration-300 font-medium"
            placeholder="usuario"
          />
        </div>
      </div>

      <button 
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white text-black py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-[#eeeeee] shadow-sm active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Registrarse con Google
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-[#999999] uppercase tracking-widest mt-4 font-bold">
        Una cuenta. Todo tu universo.
      </p>
    </div>
  );
}

export function SignupForm() {
  return (
    <Suspense fallback={<div className="h-40 flex items-center justify-center"><span className="w-8 h-8 border-4 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin" /></div>}>
      <SignupFormInner />
    </Suspense>
  );
}
