"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";

export default function SignoutPage() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
    };
    performLogout();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-[#f9fafb] dark:bg-[#111] rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#eeeeee] dark:border-[#222] shadow-sm">
          <LogOut className="w-10 h-10 text-[#999999]" />
        </div>
        
        <h1 className="text-4xl font-serif mb-4 tracking-tight">Esperamos verte pronto.</h1>
        <p className="text-[#555555] dark:text-[#a1a1aa] mb-12 text-lg">
          Has cerrado sesión correctamente. Tu universo digital te estará esperando cuando vuelvas.
        </p>
        
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#999999]">
            Redireccionando en <span className="text-[#111111] dark:text-white">{countdown}</span>...
          </p>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all group"
        >
          Ir al inicio ahora
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="absolute bottom-12 text-2xl font-extrabold tracking-tighter opacity-20">
        bioly.
      </div>
    </div>
  );
}
