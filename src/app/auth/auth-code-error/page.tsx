import Link from "next/link";
import { PiArrowLeft, PiArrowsClockwise } from "react-icons/pi";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-200 dark:border-red-900/30">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-4xl font-serif mb-4 tracking-tight">
          Algo salió mal
        </h1>
        <p className="text-[#555555] dark:text-[#a1a1aa] mb-10 leading-relaxed">
          Hubo un error al iniciar sesión con Google. Esto puede ocurrir si el enlace de autenticación ha expirado o si rechazaste los permisos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all group cursor-pointer"
          >
            <PiArrowsClockwise className="w-4 h-4" />
            Intentar de nuevo
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-[#eeeeee] dark:border-[#222] px-8 py-4 rounded-xl font-semibold text-[#555555] dark:text-[#a1a1aa] hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white transition-all cursor-pointer"
          >
            <PiArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 text-2xl font-extrabold tracking-tighter opacity-20">
        bioly.
      </div>
    </div>
  );
}
