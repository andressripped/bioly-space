import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] font-sans flex flex-col items-center justify-center p-6 transition-colors duration-300">
      
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[#555555] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        
        <div className="bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222] rounded-[2.5rem] p-10 shadow-sm transition-colors duration-300">
          <div className="mb-8 text-center">
            <div className="text-3xl font-extrabold tracking-tighter mb-4 text-[#111111] dark:text-white">bioly.</div>
            <h1 className="text-3xl font-serif mb-2">Entrar a Bioly</h1>
            <p className="text-[#555555] dark:text-[#a1a1aa] text-sm">Inicia sesión o crea tu cuenta al instante.</p>
          </div>

          <LoginForm />
          
          <p className="mt-8 text-center text-[10px] text-[#999999] uppercase tracking-[0.2em] font-bold">
            Si no tienes cuenta, se creará automáticamente
          </p>
        </div>
      </div>
    </div>
  );
}
