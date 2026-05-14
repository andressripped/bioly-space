import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        {/* Large 404 */}
        <div className="text-[10rem] font-extrabold tracking-tighter leading-none text-[#eeeeee] dark:text-[#111] select-none mb-4">
          404
        </div>

        <h1 className="text-4xl font-serif mb-4 -mt-6 tracking-tight">
          Esta página no existe
        </h1>
        <p className="text-[#555555] dark:text-[#a1a1aa] mb-10 leading-relaxed">
          Es posible que hayas escrito mal la URL, o que esta página haya sido eliminada.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-[#eeeeee] dark:border-[#222] px-8 py-4 rounded-xl font-semibold text-[#555555] dark:text-[#a1a1aa] hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Mi dashboard
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 text-2xl font-extrabold tracking-tighter opacity-20">
        bioly.
      </div>
    </div>
  );
}
