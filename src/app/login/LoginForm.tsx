"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
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
    <div className="space-y-4">
      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white text-black py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-[#eeeeee] shadow-sm active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continuar con Google
          </>
        )}
      </button>
      
      <p className="text-[10px] text-center text-[#999999] uppercase tracking-widest mt-6 font-bold">
        Acceso seguro vía Google
      </p>
    </div>
  );
}
