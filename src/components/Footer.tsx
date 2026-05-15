import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#050505] border-t border-[#eeeeee] dark:border-[#222] pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="text-2xl font-extrabold tracking-tighter mb-4 block">
              bioly.
            </Link>
            <p className="text-[#555555] dark:text-[#a1a1aa] max-w-xs text-sm leading-relaxed">
              La plataforma todo-en-uno para la nueva generación de creadores y negocios digitales.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-400">Producto</h4>
            <ul className="space-y-2 text-sm text-[#555555] dark:text-[#a1a1aa]">
              <li><Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Precios</Link></li>
              <li><Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">Entrar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-400">Legal</h4>
            <ul className="space-y-2 text-sm text-[#555555] dark:text-[#a1a1aa]">
              <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Términos</Link></li>
              <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#eeeeee] dark:border-[#222] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#999999]">© {new Date().getFullYear()} Bioly Space. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            {/* Social links placeholder */}
          </div>
        </div>
      </div>
    </footer>
  );
}
